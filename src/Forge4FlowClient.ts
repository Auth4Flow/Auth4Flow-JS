import { API_URL_BASE } from "./constants";
import Config from "./types/Config";
import Feature from "./types/Feature";
import Check, {
  CheckMany,
  CheckOp,
  CheckWarrant,
  FeatureCheck,
  PermissionCheck,
} from "./types/Check";
import Permission from "./types/Permission";
import ApiClient from "./HttpClient";
import { isWarrantObject } from "./types/WarrantObject";
import Nonce from "./types/Nonce";
import * as fcl from "@onflow/fcl";
import { Service } from "@onflow/typedefs";

export default class Forge4FlowClient {
  private readonly config: Config;
  private readonly httpClient: ApiClient;

  constructor(config: Config) {
    this.config = config;
    this.httpClient = new ApiClient(this.config);

    const resolver = async (): Promise<Nonce> => {
      const url = `${this.config.endpoint || API_URL_BASE}/v1/nonce`;

      /* @ts-ignore */
      const response = await fetch(url);

      return (await response.json()) as Nonce;
    };

    fcl.config().put("fcl.accountProof.resolver", resolver);
  }

  public setSessionToken(token: string): void {
    this.config.sessionToken = token;
    this.httpClient.setSessionToken(token);
  }

  public async login(): Promise<string> {
    const res = await fcl.reauthenticate();

    const accountProofService = res.services.find(
      (services: Service) => services.type === "account-proof"
    );

    if (accountProofService) {
      const response = await this.httpClient.post({
        url: "/v1/session",
        data: accountProofService.data,
      });

      if (response.sessionId) {
        this.setSessionToken(response.sessionId);
        return response.sessionId;
      }
    }

    fcl.unauthenticate();

    return;
  }

  public async verifySession(): Promise<boolean> {
    const response = await this.httpClient.get({
      url: "/v1/session/verify",
    });

    return response.result === "Valid";
  }

  public async check(check: Check): Promise<boolean> {
    const response = await this.httpClient.post({
      url: "/v2/authorize",
      data: {
        op: CheckOp.AnyOf,
        warrants: [
          {
            objectType: isWarrantObject(check.object)
              ? check.object.getObjectType()
              : check.object.objectType,
            objectId: isWarrantObject(check.object)
              ? check.object.getObjectId()
              : check.object.objectId,
            relation: check.relation,
            context: check.context,
          },
        ],
        consistentRead: check.consistentRead,
        debug: check.debug,
      },
    });
    return response.result === "Authorized";
  }

  public async checkMany(check: CheckMany): Promise<boolean> {
    const response = await this.httpClient.post({
      url: "/v2/authorize",
      data: {
        op: check.op,
        warrants: check.warrants.map((warrant: CheckWarrant) => ({
          objectType: isWarrantObject(warrant.object)
            ? warrant.object.getObjectType()
            : warrant.object.objectType,
          objectId: isWarrantObject(warrant.object)
            ? warrant.object.getObjectId()
            : warrant.object.objectId,
          relation: warrant.relation,
          context: warrant.context,
        })),
        consistentRead: check.consistentRead,
        debug: check.debug,
      },
    });
    return response.result === "Authorized";
  }

  public async hasFeature(featureCheck: FeatureCheck): Promise<boolean> {
    return this.check({
      object: new Feature(featureCheck.featureId),
      relation: "member",
      context: featureCheck.context,
      consistentRead: featureCheck.consistentRead,
      debug: featureCheck.debug,
    });
  }

  public async hasPermission(
    permissionCheck: PermissionCheck
  ): Promise<boolean> {
    return this.check({
      object: new Permission(permissionCheck.permissionId),
      relation: "member",
      context: permissionCheck.context,
      consistentRead: permissionCheck.consistentRead,
      debug: permissionCheck.debug,
    });
  }
}
