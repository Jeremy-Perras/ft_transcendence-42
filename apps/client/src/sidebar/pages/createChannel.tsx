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
        <button
          onClick={() => setForm(!form)}
          className="h-10 w-10 bg-black  "
        />
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

          <input type="submit" />
        </form>
      </div>
    </>
  );
}
