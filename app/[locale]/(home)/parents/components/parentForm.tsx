
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {ResetIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { ParentRegistrationSchema } from "@/validators/parentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState} from "react";
import CalendarDatePicker from "../../students/components/date-picker";
import { ScrollArea} from "@/components/ui/scroll-area";
import ImageUpload from "../../students/components/uploadFile";
import Combobox from "@/components/ui/comboBox";
import { LoadingButton } from "@/components/ui/loadingButton";
import { z } from "zod";
import { useData } from "@/context/admin/fetchDataContext";
import { addParent } from "@/lib/hooks/parents";
import { uploadFilesAndLinkToCollection } from "@/context/admin/hooks/useUploadFiles";
import { useTranslations } from "next-intl";
import { functions } from "@/firebase/firebase-config";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "sonner";
const fieldNames = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "address",
  "city",
  "state",
  "postalCode",
  "country",
  "numberOfChildren",
  "parentEmail",
  "parentPhone",
  "secondParentName",
  "secondParentPhone",

];
const genders = [
  {
    value: "male",
    label: "Male",
  },
  {
    value: "female",
    label: "Female",
  },
];

type FormKeys =
  | 'firstName'
  | 'lastName'
  | 'dateOfBirth'
  | 'gender'
  | 'address'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'country'
  | 'parentEmail'
  | 'parentPhone'
  | 'secondParentName'
  | 'secondParentPhone'
  |"numberOfChildren"

  type ParentFormValues = z.infer<typeof ParentRegistrationSchema>;
  interface FileUploadProgress {
    file: File;
    name: string;
    source:any;
  }

 function ParentForm() {

  const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);
  const {setParents}=useData()
  const [openGender, setOpenGender] = useState(false);
  const form = useForm<ParentFormValues>({
    resolver: zodResolver(ParentRegistrationSchema),
    defaultValues:{
      id:"ididid",
      paymentStatus:'Active',
      totalPayment:0,
    }
  });
  const t=useTranslations()
  const { reset, formState, setValue, getValues,watch } = form;
  const { isSubmitting } = formState;

  const renderInput = (fieldName:string, field:any) => {
    switch (fieldName) {
      case "dateOfBirth":
        return (
          <CalendarDatePicker
            {...field}
            date={getValues("dateOfBirth")}
            setDate={(selectedValue) => {
              if (selectedValue === undefined) {
                // Handle undefined case if needed
              } else {
                form.setValue(fieldName, selectedValue);
              }
            }}
          />
        );
        case "gender":
          return (
            <Combobox
              {...field}
              open={openGender}
              setOpen={setOpenGender}
              placeHolder={t("gender")}
              options={genders}
              value={getValues("gender")} // Set the value based on the form's current value for the field
              onSelected={(selectedValue) => {
                const gender: "male" | "female" | "other" = selectedValue as "male" | "female" | "other";

                form.setValue(fieldName, gender);
              }}
            />
          );
        case "salary":
            return (<Input {...field} onChange={event => field.onChange(+event.target.value)}/>)
        case  "numberOfChildren":
            return (<Input {...field} onChange={event => field.onChange(+event.target.value)}/>)
      default:
        return <Input {...field} />;
    }
  };
  React.useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    )
    return () => subscription.unsubscribe()
  }, [watch])

  async function onSubmit(data: ParentFormValues) {
    try {
      const addParent = httpsCallable(functions, 'createUserAndAssignRole');
      const parentadded:any=await addParent({...data,documents:[]})
      //const parentId = await addParent({...data,documents:[]});
      if(parentadded.data){
        const uploaded = await uploadFilesAndLinkToCollection("Parents",parentadded.data?.uid, filesToUpload);
        setParents((prev: ParentFormValues[]) => [
       
          { ...data, id: parentadded.data?.uid, parent: `${data.firstName} ${data.lastName}`,     
          value: `${data.firstName} ${data.lastName}`,
          label: `${data.firstName} ${data.lastName}`, documents: uploaded },...prev
        ]);
    
        toast("Parent Created",{
    description: `Parent account created successfully.\n\nEmail: ${data.parentEmail}\nPassword: ${parentadded.data.password}\n\nPlease save this information as the password will not be stored.`,
          action: {
            label: "Copy Password",
            onClick: () =>  navigator.clipboard.writeText(parentadded.data.password),
          },

        });
        reset();
      }
     
      
   
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle the error, e.g., show an error message to the user
    }
  }
  

  return (
    <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            {t('create-parent')} </CardTitle>
          <CardDescription></CardDescription>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={() => reset()}
          >
            <ResetIcon className="h-3.5 w-3.5" />
            <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
              {t('reset-details')} </span>
          </Button>
        </div>
      </CardHeader>
      <ScrollArea
        className="overflow-auto pt-6 text-sm"
        style={{ maxHeight: "600px" }}
      >
        <CardContent>
          <Form {...form}>
            <form>
              {fieldNames.map((fieldName, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={fieldName as FormKeys}
                  render={({ field }) => (
                    <FormItem style={{ marginBottom: 15 }}>
                      <FormLabel>{t(fieldName)}</FormLabel>
                      <FormControl>{renderInput(fieldName, field)}</FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

            </form>
          </Form>

          <ImageUpload  filesToUpload={filesToUpload} setFilesToUpload={setFilesToUpload}/>
        </CardContent>
      </ScrollArea>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <div className="flex gap-2">
          <LoadingButton
            loading={isSubmitting}
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
          >
            {t('submit')} </LoadingButton>
        </div>
      </CardFooter>
    </Card>
  );
}
export default ParentForm