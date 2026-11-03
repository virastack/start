"use client"

import type { ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useViraAddress } from "@virastack/address"
import { maskResolver, useViraMask } from "@virastack/mask"
import { useTranslations } from "next-intl"
import { Controller, useForm, useWatch } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PHONE_MASKS, TAX_MASKS } from "@/features/checkout-address/constants/addresses.constants"
import { useSaveAddress } from "@/features/checkout-address/hooks/use-save-address"
import {
  ADDRESS_TAX_TYPES,
  createAddressFormSchema
} from "@/features/checkout-address/schemas/address.schema"
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
  isDefault: false,
  addressType: "individual",
  companyName: "",
  taxNumber: "",
  taxOffice: ""
}

const FORM_MASKS = { ...PHONE_MASKS, ...TAX_MASKS }

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
  const t = useTranslations("CheckoutAddress")
  const saveAddress = useSaveAddress()
  const form = useForm<AddressFormInput>({
    resolver: maskResolver(FORM_MASKS, zodResolver(createAddressFormSchema(t))),
    defaultValues: address ?? EMPTY_VALUES
  })
  const { errors, isSubmitted, isSubmitting } = form.formState
  const addressType = useWatch({ control: form.control, name: "addressType" })
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
      form.setError("root.server", { message: t("save_error") })
    }
  })

  // The mask reports a key such as `phone.incomplete`, for the form to word.
  const phoneError = errors.phone?.message?.startsWith("phone.")
    ? t("error_phone_invalid")
    : errors.phone?.message

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="firstName" label={t("field_first_name")} error={errors.firstName?.message}>
          <Input
            id="firstName"
            autoComplete={`${type} given-name`}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            {...form.register("firstName")}
          />
        </FormField>
        <FormField name="lastName" label={t("field_last_name")} error={errors.lastName?.message}>
          <Input
            id="lastName"
            autoComplete={`${type} family-name`}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            {...form.register("lastName")}
          />
        </FormField>
      </div>
      <FormField name="phone" label={t("field_phone")} error={phoneError}>
        <Input
          {...phone}
          id="phone"
          autoComplete={`${type} tel-national`}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
      </FormField>
      <FormField name="addressLine" label={t("field_line")} error={errors.addressLine?.message}>
        <Textarea
          id="addressLine"
          rows={3}
          autoComplete={`${type} street-address`}
          aria-invalid={Boolean(errors.addressLine)}
          aria-describedby={errors.addressLine ? "addressLine-error" : undefined}
          {...form.register("addressLine")}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AddressSelect
          name="province"
          label={t("field_province")}
          placeholder={t("placeholder_province")}
          autoComplete={`${type} address-level1`}
          error={errors.province?.message}
          options={provinces}
          selectProps={getProvinceProps({ as: "shadcn" })}
        />
        <AddressSelect
          name="district"
          label={t("field_district")}
          placeholder={t("placeholder_district")}
          autoComplete={`${type} address-level2`}
          error={errors.district?.message}
          options={districts}
          selectProps={getDistrictProps({ as: "shadcn" })}
        />
        <AddressSelect
          name="neighbourhood"
          label={t("field_neighbourhood")}
          placeholder={t("placeholder_neighbourhood")}
          autoComplete={`${type} address-level3`}
          error={errors.neighbourhood?.message}
          options={neighbourhoods}
          selectProps={getNeighbourhoodProps({ as: "shadcn" })}
        />
        <FormField
          name="postalCode"
          label={t("field_postal_code")}
          error={
            postalCodeStatus === "unknown" ? t("postal_code_unknown") : errors.postalCode?.message
          }
        >
          <Input
            {...getPostalCodeInputProps({ placeholder: "34710" })}
            id="postalCode"
            inputMode="numeric"
            autoComplete={`${type} postal-code`}
            aria-invalid={postalCodeStatus === "unknown" || Boolean(errors.postalCode)}
            aria-describedby={
              postalCodeStatus === "unknown" || errors.postalCode ? "postalCode-error" : undefined
            }
          />
        </FormField>
      </div>
      <FormField name="addressName" label={t("field_title")} error={errors.addressName?.message}>
        {/* A label for this list, not part of the address, so autofill must leave it empty. */}
        <Input
          id="addressName"
          autoComplete="off"
          aria-invalid={Boolean(errors.addressName)}
          aria-describedby={errors.addressName ? "addressName-error" : undefined}
          {...form.register("addressName")}
        />
      </FormField>
      <Controller
        name="isDefault"
        control={form.control}
        render={({ field }) => (
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            {t("field_default")}
          </Label>
        )}
      />
      <Controller
        name="addressType"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel id="addressType-label">{t("field_type")}</FieldLabel>
            <RadioGroup
              aria-labelledby="addressType-label"
              className="flex flex-wrap gap-6"
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                // A hidden field must not keep a value that fails, with no error in sight.
                if (value === "individual") {
                  form.setValue("companyName", "")
                  form.setValue("taxNumber", "")
                  form.setValue("taxOffice", "")
                  form.clearErrors(["companyName", "taxNumber", "taxOffice"])
                }
              }}
            >
              {ADDRESS_TAX_TYPES.map((value) => (
                <Label key={value} className="flex items-center gap-2 font-normal">
                  <RadioGroupItem value={value} />
                  {t(`type_${value}`)}
                </Label>
              ))}
            </RadioGroup>
          </Field>
        )}
      />
      {addressType === "corporate" ? <CorporateFields form={form} type={type} /> : null}
      {errors.root?.server ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.server.message}
        </p>
      ) : null}
      <Button type="submit" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("save")}
      </Button>
    </form>
  )
}

type CorporateFieldsProps = {
  form: UseFormReturn<AddressFormInput>
  type: AddressType
}

/** Its own component, so the mask registers the tax number after the fields above it on screen. */
function CorporateFields({ form, type }: CorporateFieldsProps) {
  const t = useTranslations("CheckoutAddress")
  const { errors } = form.formState
  form.register("companyName")
  const { taxNumber } = useViraMask(form, TAX_MASKS)
  const taxNumberError = errors.taxNumber?.message?.startsWith("vkn.")
    ? t("error_tax_number_invalid")
    : errors.taxNumber?.message

  return (
    <div className="flex flex-col gap-4">
      <FormField name="companyName" label={t("field_company")} error={errors.companyName?.message}>
        <Input
          id="companyName"
          autoComplete={`${type} organization`}
          aria-invalid={Boolean(errors.companyName)}
          aria-describedby={errors.companyName ? "companyName-error" : undefined}
          {...form.register("companyName")}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="taxNumber" label={t("field_tax_number")} error={taxNumberError}>
          <Input
            {...taxNumber}
            id="taxNumber"
            autoComplete="off"
            aria-invalid={Boolean(errors.taxNumber)}
            aria-describedby={errors.taxNumber ? "taxNumber-error" : undefined}
          />
        </FormField>
        <FormField name="taxOffice" label={t("field_tax_office")} error={errors.taxOffice?.message}>
          <Input
            id="taxOffice"
            autoComplete="off"
            aria-invalid={Boolean(errors.taxOffice)}
            aria-describedby={errors.taxOffice ? "taxOffice-error" : undefined}
            {...form.register("taxOffice")}
          />
        </FormField>
      </div>
    </div>
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
      {error ? <FieldError id={`${name}-error`}>{error}</FieldError> : null}
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
        <SelectTrigger
          id={name}
          className="w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        >
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
