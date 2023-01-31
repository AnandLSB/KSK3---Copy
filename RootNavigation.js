import * as React from "react";

export const navigationRef = React.createRef();

export function navigate(name, params) {
  console.log("navigate called");
  navigationRef.current?.navigate(name, params);
}
