import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateChanelMutation } from "../../graphql/generated";
import { useForm } from "react-hook-form";
//TODO : fix scrollbar behind text area
export default function CreateChannel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  const createChannelMutation = useCreateChanelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["InfoUsers", {}]);
    },
  });

  return (
    <>
      <div>
        {" "}
        <form
          onSubmit={handleSubmit(() =>
            createChannelMutation.mutate({
              inviteOnly: watch("inviteOnly"),
              name: watch("Name"),
              password: watch("Password") ? watch("Password") : "",
            })
          )}
        >
          <div>
            <label htmlFor="inviteOnly"> Private ? </label>
            <input {...register("inviteOnly")} type="checkbox" />
          </div>
          <div>
            <label htmlFor="name"> Name </label>
            <input
              {...register("Name", { required: true, maxLength: 20 })}
              defaultValue="Name"
            />
          </div>
          <div>
            <label htmlFor="Password"> Password </label>
            <input {...register("Password")} defaultValue="" />
          </div>

          <input
            className="rounded-md bg-slate-100 p-2 hover:cursor-pointer hover:bg-slate-100"
            type="submit"
          />
        </form>
      </div>
    </>
  );
}
