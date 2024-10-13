import { Button, Input } from "@nextui-org/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useCallback, useRef, useState } from "react";
import { magnetRegex } from "@/ui/utils/common";
import http from "@/ui/utils/http";
import { debridAvailabilityOptions, debridTorrentQueryOptions } from "@/ui/utils/queryOptions";
import { useSelectModalStore } from "@/ui/utils/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "feaxios";
import { buttonClasses } from "@/ui/utils/classes";
import { Icons } from "@/ui/utils/icons";
import { decodeTorrentFile, toMagnetURI } from "@/ui/utils/parse-torrent";

const initialformState = {
  torrentPath: "",
  magnet: "",
  hash: "",
  torrentBytes: null as ArrayBuffer | null,
};

export const AddTorrent = () => {
  const { control, handleSubmit, setValue, setError } = useForm({
    defaultValues: initialformState,
  });

  const actions = useSelectModalStore((state) => state.actions);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const magnet = useWatch({
    control,
    name: "magnet",
  });

  const { data, isFetched, isLoading, isRefetching, refetch } = useQuery(
    debridAvailabilityOptions(magnet),
  );

  const onSubmit = useCallback(async (data: typeof initialformState) => {
    try {
      let id = "";
      setIsSubmitting(true);
      if (data.torrentBytes) {
        const res = (
          await http.put<{ id: string }>("/torrents/addTorrent", data.torrentBytes, {
            params: { host: "real-debrid.com" },
          })
        ).data;
        id = res.id;
      } else {
        const res = (
          await http.postForm<{ id: string }>("/torrents/addMagnet", {
            magnet: data.magnet,
          })
        ).data;
        id = res.id;
      }

      const torrent = await queryClient.ensureQueryData(debridTorrentQueryOptions(id));
      actions.setCurrentItem(torrent);
      actions.setOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        setError("magnet", { message: error.message });
      } else if (error instanceof AxiosError) {
        setError("magnet", { message: error.response?.data?.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const onTorrentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("torrentPath", file.name);
      file.arrayBuffer().then((buffer) => {
        setValue("torrentBytes", buffer);
        decodeTorrentFile(new Uint8Array(buffer)).then((torrent) => {
          setValue("magnet", toMagnetURI(torrent as any));
        });
      });
    }
  }, []);

  return (
    <form className="size-full flex gap-6 flex-col" onSubmit={handleSubmit(onSubmit)}>
      <input ref={inputRef} type="file" hidden accept=".torrent" onChange={onTorrentChange} />
      <div className="flex flex-col gap-6">
        <Controller
          name="torrentPath"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              aria-label="Upload Torrent"
              variant="bordered"
              isReadOnly
              labelPlacement="outside"
              autoComplete="off"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              endContent={
                <div className="flex gap-3">
                  <Icons.Upload
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
          rules={{
            required: true,
            validate: (value) => magnetRegex.test(value) || "Invalid magnet link",
          }}
          render={({ field, fieldState: { error } }) => (
            <Input
              aria-label="Add link or magnet"
              {...field}
              isInvalid={!!error}
              isClearable
              onClear={() => setValue("magnet", "")}
              errorMessage={error?.message}
              autoComplete="off"
              variant="bordered"
              labelPlacement="outside"
              placeholder="Enter magnet link"
            />
          )}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" isLoading={isSubmitting} className={buttonClasses}>
          Add Torrent
        </Button>
        <Button
          onPress={() => refetch()}
          className={buttonClasses}
          isLoading={isLoading || isRefetching}
          startContent={
            !(isLoading || isRefetching) ? <Icons.TorrentFilled className="size-[20px]" /> : null
          }
        >
          Avaliability
        </Button>
        {isFetched ? (
          data?.avaliabilities && data.avaliabilities.length > 0 ? (
            <span className="inline-flex items-center gap-2">
              <Icons.Check className="text-success" />
              <p className="text-sm">Avaliable</p>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Icons.Exclamation className="text-danger" />
              <p className="text-sm">Not Avaliable</p>
            </span>
          )
        ) : null}
      </div>
    </form>
  );
};
