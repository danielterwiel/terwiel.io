"use client";

import { useForm } from "@formspree/react";
import * as Form from "@radix-ui/react-form";

import { forwardRef, useId, useRef, useState } from "react";

import { Icon } from "~/components/icon";
import { getMagneticClasses } from "~/utils/icon-colors";

export const ContactDialog = forwardRef<HTMLDialogElement>((_, ref) => {
  const [state, handleSubmit] = useForm("mgejggnl");
  const internalRef = useRef<HTMLDialogElement>(null);
  const dialogRef = (ref || internalRef) as React.RefObject<HTMLDialogElement>;
  const emailInputId = useId();
  const questionInputId = useId();
  const [emailValue, setEmailValue] = useState("");
  const [questionValue, setQuestionValue] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
    // Close dialog on successful submission
    if (state.succeeded) {
      dialogRef.current?.close();
    }
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 w-full max-w-md rounded-lg border border-slate-200 bg-white p-0 shadow-2xl open:animate-in open:fade-in open:zoom-in-95 open:duration-200 open:backdrop:animate-in open:backdrop:fade-in"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-900">Contact Me</h2>
        <button
          type="button"
          onClick={closeDialog}
          className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-klein focus:ring-offset-2"
          aria-label="Close dialog"
        >
          <Icon.X className="h-6 w-6" />
        </button>
      </div>

      <div className="overflow-y-auto p-6">
        {state.succeeded ? (
          <p className="flex flex-col rounded-md border border-slate-500/50 bg-slate-50 p-4 text-sm text-slate-700">
            Thanks you for reaching out! I will get back to you as soon as
            possible
          </p>
        ) : (
          <Form.Root className="flex flex-col gap-4" onSubmit={onSubmit}>
            <Form.Field className="grid gap-2" name="email">
              <div className="flex items-baseline justify-between gap-2">
                <Form.Label
                  htmlFor={emailInputId}
                  className="text-sm font-medium text-slate-900"
                >
                  Email address{" "}
                  <span className="text-xs text-slate-400">(required)</span>
                </Form.Label>
                <Form.Message match="valueMissing">
                  <span className="text-xs text-red-600">
                    Please enter your email
                  </span>
                </Form.Message>
                <Form.Message match="typeMismatch">
                  <span className="text-xs text-red-600">
                    Please provide a valid email
                  </span>
                </Form.Message>
              </div>
              <div
                className={getMagneticClasses(undefined, {
                  component: "input",
                  hasQuery: !!emailValue,
                  withRing: false,
                })}
              >
                <div className="overflow-hidden rounded-lg">
                  <div className="group relative flex w-full items-center rounded-lg bg-white px-2">
                    <Icon.At
                      className="h-6 w-6 shrink-0 text-slate-400 transition-colors duration-300 group-focus-within:text-klein"
                      aria-hidden="true"
                      focusable="false"
                    />
                    <Form.Control asChild>
                      <input
                        type="email"
                        id={emailInputId}
                        autoComplete="email"
                        placeholder="e.g. yourname@domain.com"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        className="field-sizing-content w-full border-0 bg-transparent p-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
                        required
                      />
                    </Form.Control>
                  </div>
                </div>
              </div>
            </Form.Field>

            <Form.Field className="grid gap-2" name="question">
              <div className="flex items-baseline justify-between gap-2">
                <Form.Label
                  htmlFor={questionInputId}
                  className="text-sm font-medium text-slate-900"
                >
                  Question{" "}
                  <span className="text-xs text-slate-400">(required)</span>
                </Form.Label>
                <Form.Message match="valueMissing">
                  <span className="text-xs text-red-600">
                    Please enter a question
                  </span>
                </Form.Message>
              </div>
              <div
                className={getMagneticClasses(undefined, {
                  component: "input",
                  hasQuery: !!questionValue,
                  withRing: false,
                })}
              >
                <div className="overflow-hidden rounded-lg">
                  <div className="group relative flex w-full items-start rounded-lg bg-white p-2">
                    <Icon.QuestionMark
                      className="h-5 w-5 shrink-0 text-slate-400 transition-colors duration-300 pointer-events-none mt-0.5 group-focus-within:text-klein"
                      aria-hidden="true"
                      focusable="false"
                    />
                    <Form.Control asChild>
                      <textarea
                        id={questionInputId}
                        value={questionValue}
                        onChange={(e) => setQuestionValue(e.target.value)}
                        className="field-sizing-content resize-none w-full border-0 bg-transparent py-1 pl-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none min-h-24"
                        placeholder="e.g. let's talk about..."
                        required
                      />
                    </Form.Control>
                  </div>
                </div>
              </div>
            </Form.Field>

            {state.errors?.getAllFieldErrors().length ? (
              <div
                aria-live="polite"
                className="rounded-md border border-red-200 bg-red-50 p-3"
              >
                <ul className="space-y-1">
                  {state.errors?.getAllFieldErrors().map(([error]) => (
                    <li key={error} className="text-xs text-red-600">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex gap-3 pt-4">
              <Form.Submit asChild>
                <button
                  type="submit"
                  className="flex-1 relative flex h-10 items-center justify-center rounded-lg bg-klein font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-klein/30 focus:ring-2 focus:ring-klein focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={state.submitting}
                >
                  <span className="relative">
                    {state.submitting ? "Sending..." : "Send"}
                  </span>
                </button>
              </Form.Submit>
              <button
                type="button"
                onClick={closeDialog}
                className="flex-1 relative flex h-10 items-center justify-center rounded-lg border border-slate-300 font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-klein focus:ring-offset-2 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </Form.Root>
        )}
      </div>
    </dialog>
  );
});

ContactDialog.displayName = "ContactDialog";
