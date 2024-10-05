import http from "@/ui/utils/http";
import { debridTorrentQueryOptions } from "@/ui/utils/queryOptions";
import { useDebridStore } from "@/ui/utils/store";
import { Button, Textarea } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { DebridUnlock } from "@/types";

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
    <div className="size-full flex gap-6 flex-col">
      <div className="space-y-2">
        <Controller
          name="links"
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
        <Button
          isLoading={status === "running"}
          className="bg-white/5 data-[hover=true]:border-zinc-100 rounded-full border-2 border-transparent transition"
          onPress={() => handleSubmit(onSubmit)()}
        >
          Unrestrict
        </Button>
      </div>
    </div>
  );
};
