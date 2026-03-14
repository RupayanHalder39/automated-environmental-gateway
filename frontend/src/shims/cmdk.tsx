import * as React from "react";

export type CommandProps = React.ComponentPropsWithoutRef<"div">;

export function Command(props: CommandProps) {
  return <div {...props} />;
}
