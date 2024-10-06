import http from "@/ui/utils/http";
import { debridTorrentQueryOptions } from "@/ui/utils/queryOptions";
import { useDebridStore } from "@/ui/utils/store";
import { Button, Textarea } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { DebridUnlock } from "@/types";
import { buttonClasses } from "@/ui/utils/classes";

const initialformState = {
  links: "",
};

export const UnRestrictLink = () => {
  const { fileId } = useSearch({ from: "/_authenticated/downloader/$tabId" });

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
        const res = await http.postForm<DebridUnlock>("/unrestrict/link", {
          link: link.trim(),
        });
        actions.addUnrestrictedFile(res.data);
      }
    } finally {
      actions.setUnRestrictState("idle");
    }
  };

  useEffect(() => {
    if (data) {
      setValue("links", data.links.join("\n"));
    }
  }, [data]);

  useEffect(() => {
    return () => {
      actions.clearUnrestrictedFiles();
    };
  }, []);

  return (
    <form className="size-full flex gap-6 flex-col" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
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
      </div>
      <div className="flex items-center">
        <Button type="submit" isLoading={status === "running"} className={buttonClasses}>
          Unrestrict
        </Button>
      </div>
    </form>
  );
};
