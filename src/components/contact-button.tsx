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
    <button onClick={scrollToContactForm} className="group">
      <Icon.Mail
        className="text-white opacity-60 hover:opacity-100 group-focus:opacity-100 md:text-slate-800"
        aria-hidden="true"
        focusable="false"
      />
      <span className="sr-only">Contact</span>
    </button>
  );
}
