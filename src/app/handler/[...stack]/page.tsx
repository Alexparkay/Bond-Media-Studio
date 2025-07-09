import { stackServerApp } from "@/auth/stack-auth";
import { StackHandler } from "@stackframe/stack";
import { AccountSettingsWrapper } from "./account-settings-wrapper";

export default function Handler(props: unknown) {
  return (
    <AccountSettingsWrapper>
      <StackHandler fullPage app={stackServerApp} routeProps={props} />
    </AccountSettingsWrapper>
  );
}
