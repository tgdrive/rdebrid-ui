import { Button, Input } from "@nextui-org/react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { useCallback } from "react";
import { magnetRegex } from "@/ui/utils/common";

import { debridAvailabilityOptions } from "@/ui/utils/queryOptions";
import { useQuery } from "@tanstack/react-query";

import EpSuccessFilled from "~icons/ep/success-filled";
import MdiError from "~icons/mdi/error";
import { buttonClasses } from "@/ui/utils/classes";

const initialformState = {
  magnet: "",
};

export const CheckAvaliability = () => {
  const { control } = useForm({
    defaultValues: initialformState,
  });

  const magnet = useWatch({ control, name: "magnet" });

  const { data, isFetched, isLoading, refetch } = useQuery(debridAvailabilityOptions(magnet));

  const onSubmit = useCallback(() => {
    if (magnet) {
      refetch();
    }
  }, [magnet]);

  return (
    <div className="size-full flex gap-6 flex-col">
      <div className="flex flex-col gap-6">
        <Controller
          name="magnet"
          control={control}
          rules={{
            pattern: { value: magnetRegex, message: "Invalid Magnet" },
          }}
          render={({ field, fieldState: { error } }) => (
            <Input
              aria-label="Enter Magnet"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              variant="bordered"
              labelPlacement="outside"
              placeholder="Enter Magnet"
            />
          )}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button onPress={onSubmit} className={buttonClasses} isLoading={isLoading}>
          Check
        </Button>
        {isFetched ? (
          data?.avaliabilities && data.avaliabilities.length > 0 ? (
            <span className="inline-flex items-center gap-2">
              <EpSuccessFilled className="size-6 text-success" />
              <p className="text-sm">Avaliable</p>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <MdiError className="size-6 text-danger" />
              <p className="text-sm">Not Avaliable</p>
            </span>
          )
        ) : null}
      </div>
    </div>
  );
};
