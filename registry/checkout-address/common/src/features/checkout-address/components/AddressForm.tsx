"use client"

import type { ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useViraAddress } from "@virastack/address"
import { maskResolver, useViraMask } from "@virastack/mask"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PHONE_MASKS } from "@/features/checkout-address/constants/addresses.constants"
import { useSaveAddress } from "@/features/checkout-address/hooks/use-save-address"
import { addressFormSchema } from "@/features/checkout-address/schemas/address.schema"
import type {
  Address,
  AddressFormInput,
  AddressType
} from "@/features/checkout-address/schemas/address.schema"

const EMPTY_VALUES: AddressFormInput = {
  addressName: "",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine: "",
  provinceCode: "",
  province: "",
  district: "",
  neighbourhood: "",
  postalCode: "",
  isDefault: false
}

const ADDRESS_NAMES = {
  province: "province",
  district: "district",
  neighbourhood: "neighbourhood",
  postalCode: "postalCode",
  provinceCode: "provinceCode"
} as const

type AddressFormProps = {
  /** Sets the browser's autofill section, so it offers the right saved address. */
  type: AddressType
  /** Fills the form to edit this address; `null` starts it empty. */
  address: Address | null
  onSaved: (saved: Address) => void
}

export function AddressForm({ type, address, onSaved }: AddressFormProps) {
  const saveAddress = useSaveAddress()
  const form = useForm<AddressFormInput>({
    resolver: maskResolver(PHONE_MASKS, zodResolver(addressFormSchema)),
    defaultValues: address ?? EMPTY_VALUES
  })
  const { errors, isSubmitted, isSubmitting } = form.formState
  // A failed submit focuses the first registered field with an error, and the mask registers the
  // phone while rendering, so the fields above it on screen must register first.
  form.register("firstName")
  form.register("lastName")
  const { phone } = useViraMask(form, PHONE_MASKS)
  const {
    provinces,
    districts,
    neighbourhoods,
    getProvinceProps,
    getDistrictProps,
    getNeighbourhoodProps,
    getPostalCodeInputProps,
    postalCodeStatus
    // Picking a province clears the levels below it, which must not show errors before a submit.
  } = useViraAddress({ form, names: ADDRESS_NAMES, shouldValidate: isSubmitted })

  const onSubmit = form.handleSubmit(async (input) => {
    try {
      onSaved(await saveAddress.mutateAsync({ input, id: address?.id }))
    } catch {
      form.setError("root.server", { message: "Could not save the address. Try again." })
    }
  })

  // The mask reports a key such as `phone.incomplete`, for the form to word.
  const phoneError = errors.phone?.message?.startsWith("phone.")
    ? "Enter all 10 digits of the phone number"
    : errors.phone?.message

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="firstName" label={"First name"} error={errors.firstName?.message}>
          <Input
            id="firstName"
            autoComplete={`${type} given-name`}
            aria-invalid={Boolean(errors.firstName)}
            {...form.register("firstName")}
          />
        </FormField>
        <FormField name="lastName" label={"Last name"} error={errors.lastName?.message}>
          <Input
            id="lastName"
            autoComplete={`${type} family-name`}
            aria-invalid={Boolean(errors.lastName)}
            {...form.register("lastName")}
          />
        </FormField>
      </div>
      <FormField name="phone" label={"Mobile phone for delivery"} error={phoneError}>
        <Input
          {...phone}
          id="phone"
          autoComplete={`${type} tel-national`}
          aria-invalid={Boolean(errors.phone)}
        />
      </FormField>
      <FormField name="addressLine" label={"Address line"} error={errors.addressLine?.message}>
        <Textarea
          id="addressLine"
          rows={3}
          autoComplete={`${type} street-address`}
          aria-invalid={Boolean(errors.addressLine)}
          {...form.register("addressLine")}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AddressSelect
          name="province"
          label={"Province"}
          placeholder={"Select a province"}
          autoComplete={`${type} address-level1`}
          error={errors.province?.message}
          options={provinces}
          selectProps={getProvinceProps({ as: "shadcn" })}
        />
        <AddressSelect
          name="district"
          label={"District"}
          placeholder={"Select a district"}
          autoComplete={`${type} address-level2`}
          error={errors.district?.message}
          options={districts}
          selectProps={getDistrictProps({ as: "shadcn" })}
        />
        <AddressSelect
          name="neighbourhood"
          label={"Neighbourhood"}
          placeholder={"Select a neighbourhood"}
          autoComplete={`${type} address-level3`}
          error={errors.neighbourhood?.message}
          options={neighbourhoods}
          selectProps={getNeighbourhoodProps({ as: "shadcn" })}
        />
        <FormField
          name="postalCode"
          label={"Postal code"}
          error={
            postalCodeStatus === "unknown"
              ? "This postal code was not found."
              : errors.postalCode?.message
          }
        >
          <Input
            {...getPostalCodeInputProps({ placeholder: "34710" })}
            id="postalCode"
            inputMode="numeric"
            autoComplete={`${type} postal-code`}
            aria-invalid={postalCodeStatus === "unknown" || Boolean(errors.postalCode)}
          />
        </FormField>
      </div>
      <FormField name="addressName" label={"Address title"} error={errors.addressName?.message}>
        {/* A label for this list, not part of the address, so autofill must leave it empty. */}
        <Input
          id="addressName"
          autoComplete="off"
          aria-invalid={Boolean(errors.addressName)}
          {...form.register("addressName")}
        />
      </FormField>
      <Controller
        name="isDefault"
        control={form.control}
        render={({ field }) => (
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            Make this my default address
          </Label>
        )}
      />
      {errors.root?.server ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.server.message}
        </p>
      ) : null}
      <Button type="submit" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save address"}
      </Button>
    </form>
  )
}

type FormFieldProps = {
  name: string
  label: string
  error?: string
  children: ReactNode
}

function FormField({ name, label, error, children }: FormFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

type AddressSelectProps = {
  name: string
  label: string
  placeholder: string
  autoComplete: string
  error?: string
  options: readonly { value: string; label: string }[]
  selectProps: ReturnType<ReturnType<typeof useViraAddress>["getProvinceProps"]>
}

function AddressSelect({
  name,
  label,
  placeholder,
  autoComplete,
  error,
  options,
  selectProps
}: AddressSelectProps) {
  return (
    <FormField name={name} label={label} error={error}>
      <Select {...selectProps} name={name} autoComplete={autoComplete} items={options}>
        <SelectTrigger id={name} className="w-full" aria-invalid={Boolean(error)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}
