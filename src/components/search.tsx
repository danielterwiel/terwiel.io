"use client";

import * as Form from "@radix-ui/react-form";
import React from "react";

export const SearchContext = React.createContext<
  [string, React.Dispatch<React.SetStateAction<string>> | (() => void)]
>([
  "",
  () => {
    throw new Error("SearchContext not implemented");
  },
]);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <SearchContext.Provider value={[searchTerm, setSearchTerm]}>
      {children}
    </SearchContext.Provider>
  );
};

export function SearchInput() {
  const [searchTerm, setSearchTerm] = React.useContext(SearchContext);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event?.target?.value);
  };

  return (
    <Form.Root className="print:hidden" onSubmit={(e) => e.preventDefault()}>
      <Form.Field name="term">
        <div>
          <Form.Label>Search keyword</Form.Label>
          <Form.Message match="typeMismatch">
            Please provide a your search term
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input
            type="input"
            placeholder="e.g. Sendcloud, 2022, Rust"
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full rounded-md border px-4 py-2 transition-colors focus:border-klein focus:outline-none"
          />
        </Form.Control>
      </Form.Field>
    </Form.Root>
  );
}
