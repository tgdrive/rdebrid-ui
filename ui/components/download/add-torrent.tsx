import { Button, Input } from "@nextui-org/react";
import { Controller, useForm } from "react-hook-form";
import UploadIcon from "~icons/material-symbols/upload";
import { useCallback, useRef, useState } from "react";
import { magnetRegex } from "@/ui/utils/common";
import http from "@/ui/utils/http";
import { decodeTorrentFile, toMagnetURI } from "@/ui/utils/parse-torrent";
import { debridTorrentQueryOptions } from "@/ui/utils/queryOptions";
import { useSelectModalStore } from "@/ui/utils/store";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "feaxios";

const initialformState = {
  torrentPath: "",
  magnet: "",
  hash: "",
};

export const AddTorrent = () => {
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: initialformState,
  });

  const actions = useSelectModalStore((state) => state.actions);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = useCallback(async (data: typeof initialformState) => {
    if (data.magnet) {
      try {
        setIsSubmitting(true);
        if (!magnetRegex.test(data.magnet)) {
          const buffer = await http.get<ArrayBuffer>("/api/cors", {
            responseType: "arrayBuffer",
            params: { link: data.magnet },
          });
          data.magnet = toMagnetURI((await decodeTorrentFile(new Uint8Array(buffer.data))) as any);
        }
        const res = (
          await http.postForm<{ id: string; uri: string }>("/torrents/addMagnet", {
            magnet: data.magnet,
          })
        ).data;
        const torrent = await queryClient.ensureQueryData(debridTorrentQueryOptions(res.id));
        actions.setCurrentItem(torrent);
        actions.setOpen(true);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  }, []);

  const onTorrentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("torrentPath", file.name);
      file.arrayBuffer().then((buffer) => {
        decodeTorrentFile(new Uint8Array(buffer)).then((torrent) => {
          setValue("magnet", toMagnetURI(torrent as any));
        });
      });
    }
  }, []);

  return (
    <div className="size-full flex gap-6 flex-col">
      <input ref={inputRef} type="file" hidden accept=".torrent" onChange={onTorrentChange} />
      <div className="flex flex-col gap-6">
        <Controller
          name="torrentPath"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              aria-label="Upload Torrent"
              variant="bordered"
              labelPlacement="outside"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              endContent={
                <div className="flex gap-3">
                  <UploadIcon
                    className="cursor-pointer text-2xl"
                    onClick={() => inputRef.current?.click()}
                  />
                </div>
              }
              placeholder="Upload torrent"
            />
          )}
        />
        <Controller
          name="magnet"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              aria-label="Add link or magnet"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              variant="bordered"
              labelPlacement="outside"
              placeholder="Add torrent link or magnet"
            />
          )}
        />
      </div>
      <div className="flex items-center">
        <Button
          onPress={() => handleSubmit(onSubmit)()}
          isLoading={isSubmitting}
          className="bg-white/5 data-[hover=true]:border-zinc-100 rounded-full border-2 border-transparent transition"
        >
          Add Torrent
        </Button>
      </div>
    </div>
  );
};
