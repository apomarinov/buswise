import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Button, FormControl, Input } from "@chakra-ui/react";
import { api } from "app/api";
import { capitalize } from "app/helpers/string";
import { type FormDataMap, type StringMap } from "app/types/client";
import React, { useState } from "react";

type Props = {
  title: string;
  apiUrl: string;
  replaceTitle?: boolean;
  data?: FormDataMap;
  fields: string[];
  onClose?: () => void;
  onSave?: (data: FormDataMap, isNew: boolean) => void;
};

const ModalForm: React.FC<Props> = ({
  apiUrl,
  fields,
  title,
  data,
  onClose = () => 1,
  onSave = (data: FormDataMap, isNew: boolean) => 1,
  replaceTitle,
}) => {
  const [form, setForm] = useState(
    fields.map((field) => ({ field, value: data?.[field] ?? "" })),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<StringMap>({});

  const onSubmit = async () => {
    setIsLoading(true);

    const body: FormDataMap = { ...data };
    form.forEach((item) => {
      body[item.field] = item.value ?? "";
    });

    let url = apiUrl;
    if (data?.id) {
      url = `${apiUrl}/${data.id}`;
    } else {
      delete body.id;
    }

    const res = await api(url, {
      method: data?.id ? "PUT" : "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setIsLoading(false);
    setErrors(
      res.validation?.reduce((prev, curr) => {
        prev[curr.field] = curr.message;
        return prev;
      }, {} as StringMap) ?? {},
    );

    if (res.success) {
      onClose?.();
      onSave?.(res.data as FormDataMap, !data?.id);
    } else if (!res.validation) {
      setErrors({ _error: res.message });
    }
  };

  const onInputChange = (value: string, idx: number, field: string) => {
    if (form[idx]) {
      form[idx].value = value;
      setForm([...form]);
      if (value.length) {
        setErrors((old) => {
          delete old[field];
          return { ...old };
        });
      }
    }
  };

  let formTitle = title;
  if (!replaceTitle) {
    if (data?.id) {
      formTitle = `Edit ${title}`;
    } else {
      formTitle = `New ${title}`;
    }
  }

  return (
    <Modal isOpen onClose={onClose} closeOnOverlayClick={!isLoading} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{formTitle}</ModalHeader>
        <ModalBody>
          <FormControl as="fieldset">
            {form.map((item, idx) => (
              <div key={item.field}>
                <Input
                  isDisabled={isLoading}
                  variant="flushed"
                  isInvalid={!!errors[item.field]}
                  placeholder={capitalize(item.field)}
                  autoFocus={idx === 0}
                  size="md"
                  value={item.value ?? ""}
                  onChange={(e) =>
                    onInputChange(e.target.value, idx, item.field)
                  }
                />
                {errors[item.field] && (
                  <p className="font-semibold text-red-400 text-xs">
                    {errors[item.field]}
                  </p>
                )}
              </div>
            ))}
          </FormControl>
          <div className="mt-4">
            {errors._error && (
              <p className="font-semibold text-red-400 text-xs">
                {errors._error}
              </p>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            isDisabled={isLoading}
            variant="ghost"
            mr={3}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button isLoading={isLoading} colorScheme="blue" onClick={onSubmit}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalForm;
