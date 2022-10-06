import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";
import radix from "classnames";

export default function Dialog() {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>click</DialogPrimitive.Trigger>
      <DialogPrimitive.Content
        forceMount
        className={cx(
          "fixed z-50",
          "w-[95vw] max-w-md rounded-lg p-4 md:w-full",
          "top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
          "bg-white dark:bg-gray-800",
          "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
        )}
      >
        <DialogPrimitive.Title className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Edit profile
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="mt-2 text-sm font-normal text-gray-700 dark:text-gray-400">
          Make changes to your profile here. Click save when you&apos;re done.
        </DialogPrimitive.Description>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  );
}
