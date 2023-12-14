"use client";

import { useForm } from "@formspree/react";
import * as Form from "@radix-ui/react-form";

export default function Contact() {
  const [state, handleSubmit] = useForm("mgejggnl");
  if (state.succeeded) {
    return (
      <p className="flex flex-col rounded-md border border-slate-500/50 p-4 text-klein print:hidden md:p-8">
        Thanks you for reaching out! I will get back to you as soon as possible
      </p>
    );
  }

  return (
    <div id="form-contact">
      <h2>Contact</h2>
      <Form.Root
        className="flex flex-col gap-4 rounded-md border border-slate-500/50 p-4 print:hidden md:p-8"
        onSubmit={handleSubmit}
      >
        <Form.Field className="grid" name="email">
          <div className="flex items-baseline justify-between">
            <Form.Label htmlFor="input-email">
              Email <span className="text-sm text-red-600">(required)</span>
            </Form.Label>
            <Form.Message match="valueMissing">
              <span className="text-red-600">Please enter your email</span>
            </Form.Message>
            <Form.Message match="typeMismatch">
              <span className="text-red-600">Please provide a valid email</span>
            </Form.Message>
          </div>
          <Form.Control asChild>
            <input
              type="email"
              id="input-email"
              autoComplete="email"
              placeholder="e.g. yourname@domain.com"
              className="rounded-md border border-slate-500/50 p-2 hover:border-klein focus:ring-klein focus:ring-offset-2"
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field className="grid" name="question">
          <div className="flex items-baseline justify-between">
            <Form.Label>
              Question <span className="text-sm text-red-600">(required)</span>
            </Form.Label>
            <Form.Message match="valueMissing">
              <span className="text-red-600">Please enter a question</span>
            </Form.Message>
          </div>
          <Form.Control asChild>
            <textarea
              className="rounded-md border border-slate-500/50 p-2 hover:border-klein focus:ring-klein focus:ring-offset-2"
              placeholder="e.g. let's talk about..."
              required
            />
          </Form.Control>
        </Form.Field>

        {/* FIXME: use a Form.Message here, currently blocked by https://github.com/radix-ui/primitives/issues/2279 */}
        <div aria-live="polite">
          {state.errors?.getAllFieldErrors().length ? (
            <ul>
              {state.errors?.getAllFieldErrors().map(([error]) => (
                <li key={error} className="text-red-600">
                  {error}
                </li>
              ))}
            </ul>
          ) : (
            <></>
          )}
        </div>
        <Form.Submit asChild>
          <button
            type="submit"
            className="relative flex h-12 items-center justify-center overflow-hidden rounded-md bg-klein font-medium text-white shadow-2xl duration-300 before:absolute before:inset-0 before:border-0 before:border-white before:duration-100 before:ease-linear hover:border hover:border-klein/80 hover:bg-white hover:text-klein hover:shadow-klein/90 hover:before:border-[25px] focus:bg-white focus:text-klein focus:shadow-klein/90 focus:ring-2 focus:ring-klein focus:ring-offset-2 motion-safe:transition-all print:hidden"
            disabled={state.submitting}
          >
            <span className="relative">Contact</span>
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
}
