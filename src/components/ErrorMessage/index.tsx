"use client";

import clsx from "clsx";

type ErrorMessageProps = {
  pageTitle?: string;
  contentTitle: string;
  content: React.ReactNode;
};

export default function ErrorMessage({
  pageTitle = "",
  contentTitle,
  content,
}: ErrorMessageProps) {
  return (
    <>
      {pageTitle && <title>{pageTitle}</title>}
      <title>{pageTitle}</title>
      <div
        className={clsx(
          "min-h-[320px] bg-slate-900 text-slate-100",
          "mb-16 rounded-xl p-8",
          "flex flex-col items-center justify-center",
        )}
      >
        <h1 className="mb-4 text-7xl/tight font-bold">{contentTitle}</h1>
        <div className="text-center">{content}</div>
      </div>
    </>
  );
}
