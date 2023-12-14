"use client";

import React from "react";

import { Icon } from "~/components/icon";

export default function ContactButton() {
  const scrollToContactForm = () => {
    const contactForm = document.getElementById("form-contact");
    const emailInput = document.getElementById("input-email");
    contactForm?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => emailInput?.focus(), 500);
  };

  return (
    <button onClick={scrollToContactForm} className="group print:hidden">
      <Icon.Mail
        aria-hidden="true"
        className="text-white opacity-60 hover:opacity-100 group-focus:opacity-100 sm:text-slate-800"
      />
      <span className="sr-only">Contact</span>
    </button>
  );
}
