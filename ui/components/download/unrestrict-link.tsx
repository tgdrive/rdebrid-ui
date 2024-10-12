import http from "@/ui/utils/http";
import { debridTorrentQueryOptions } from "@/ui/utils/queryOptions";
import { useDebridStore } from "@/ui/utils/store";
import { Button, Input, Textarea } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { DebridUnlock } from "@/types";
import { buttonClasses } from "@/ui/utils/classes";
import { isAxiosError } from "feaxios";
import { defaultUnlockLinkAvatar } from "@/ui/utils/common";
import { CopyButton } from "../copy-button";

const initialformState = {
  links: "",
  password: "",
};

export const UnRestrictLink = () => {
  const { fileId, restrictedId } = useSearch({ from: "/_authed/downloader/$tabId" });

  const { data } = useQuery(debridTorrentQueryOptions(fileId));

  const { control, setValue, handleSubmit } = useForm({
    defaultValues: initialformState,
  });

  const status = useDebridStore((state) => state.unRestrictState);

  const actions = useDebridStore((state) => state.actions);

  const onSubmit = async (data: typeof initialformState) => {
    const links = data.links.split("\n");
    actions.setUnRestrictState("running");
    try {
      for (const link of links) {
        try {
          const res = await http.postForm<DebridUnlock>("/unrestrict/link", {
            link: link.trim(),
            password: data.password.trim(),
          });
          actions.addUnrestrictedFile(res.data);
        } catch (err) {
          if (isAxiosError<DebridUnlock>(err)) {
            actions.addUnrestrictedFile({
              link,
              error: err.response?.data.error || err.message,
              host_icon: defaultUnlockLinkAvatar,
            } as any);
          }
        }
      }
    } finally {
      actions.setUnRestrictState("idle");
    }
  };

  useEffect(() => {
    if (data) {
      setValue("links", data.links.join("\n"));
    }
    if (restrictedId) {
      setValue("links", `https://real-debrid.com/d/${restrictedId}`);
    }
  }, [data, restrictedId]);

  useEffect(() => {
    return () => {
      actions.clearUnrestrictedFiles();
    };
  }, []);

  return (
    <form className="size-full flex gap-6 flex-col" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="links"
        rules={{ required: "Enter host links" }}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Textarea
            aria-label="Enter your host links"
            {...field}
            isInvalid={!!error}
            errorMessage={error?.message}
            variant="bordered"
            minRows={8}
            placeholder="Enter your host links here..."
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            aria-label="Password"
            variant="bordered"
            labelPlacement="outside"
            className="w-1/3 min-w-40"
            autoComplete="off"
            {...field}
            isInvalid={!!error}
            errorMessage={error?.message}
            placeholder="Enter Password"
          />
        )}
      />

      <div className="flex items-center">
        <Button type="submit" isLoading={status === "running"} className={buttonClasses}>
          Unrestrict
        </Button>
      </div>
    </form>
  );
};
