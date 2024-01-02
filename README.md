# @forge4flow/forge4flow-js

Use [Forge4FlowClient](https://forge4Flow.dev/) as an ES module.

[![npm](https://img.shields.io/npm/v/@forge4flow/forge4flow-js)](https://www.npmjs.com/package/@forge4flow/forge4flow-js)

## Installation

Use `npm` to install the Forge4FlowClient module:

```sh
npm install @forge4flow/forge4flow-js
```

## Usage

Import the Forge4FlowClient and initiate the client & login or pass a sessionToken in as part of the configurations:

> IMPORTANT: Ensure you have configured FCL alrady or these methods will fails

```js
import Forge4FlowClient from "@forge4flow/forge4flow-js";

// A valid session token is required to initialize the Client
const forge4Flow = new Forge4FlowClient({
  clientKey: "client_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=",
  endpoint: "https://your-core-endpont",
  sessionToken: "Optional Value", // DO NOT CALL LOGIN IF PASSING IN A SESSION TOKEN
});

forge4Flow.login();
```

### `check`

This function returns a `Promise` that resolves with `true` if the user for the current session token has the specified `warrant` and `false` otherwise.

```js
//
// Example Scenario:
// An e-commerce website where Store Owners can edit their own Store's info
//
forge4Flow
  .check({ object: myReport, relation: "editor" })
  .then((isAuthorized) => {
    if (isAuthorized) {
      // Carry out logic to allow user to edit a Store
    }
  });
```

Or using async/await:

```js
//
// Example Scenario:
// An e-commerce website where Store Owners can edit their own Store's info
//
const isAuthorized = await forge4Flow.check({
  object: myReport,
  relation: "editor",
});
if (isAuthorized) {
  // Carry out logic to allow user to edit a Store
}
```

### `checkMany`

This function returns a `Promise` that resolves with `true` if the user for the current session token has `allOf` or `anyOf` (depending on the passed in `op`) the specified `warrants` and `false` otherwise.

**CheckOp.AnyOf** specifies that the access check request will be authorized if _any of_ the warrants are matched and will not be authorized otherwise.

**CheckOp.AllOf** specifies that the access check request will be authorized if _all of_ the warrants are matched and will not be authorized otherwise.

```js
forge4Flow
  .checkMany({
    op: CheckOp.AllOf,
    warrants: [
      {
        object: tenantA,
        relation: "member",
      },
      {
        object: reportA,
        relation: "editor",
      },
    ],
  })
  .then((isAuthorized) => {
    if (isAuthorized) {
      // Carry out logic if user is member of tenantA AND editor of reportA
    }
  });
```

Or using async/await:

```js
const isAuthorized = await forge4Flow.checkMany({
  op: CheckOp.AllOf,
  warrants: [
    {
      object: tenantA,
      relation: "member",
    },
    {
      object: reportA,
      relation: "editor",
    },
  ],
});
if (isAuthorized) {
  // Carry out logic if user is member of tenantA AND editor of reportA
}
```

### `hasPermission`

This function returns a `Promise` that resolves with `true` if the user for the current session token has the specified permission and `false` otherwise.

```js
forge4Flow
  .hasPermission({ permissionId: "view-items" })
  .then((canViewItems) => {
    if (canViewItems) {
      // Carry out logic if user has permission view-items
    }
  });
```

Or using async/await:

```js
const canViewItems = await forge4Flow.hasPermission({
  permissionId: "view-items",
});
if (canViewItems) {
  // Carry out logic if user has permission view-items
}
```

### `hasFeature`

This function returns a `Promise` that resolves with `true` if the user for the current session token has the specified feature and `false` otherwise.

```js
forge4Flow.hasFeature({ featureId: "save-items" }).then((canSaveItems) => {
  if (canSaveItems) {
    // Carry out logic if user has feature save-items
  }
});
```

Or using async/await:

```js
const canSaveItems = await forge4Flow.hasFeature({ featureId: "save-items" });
if (canSaveItems) {
  // Carry out logic if user has feature save-items
}
```
