import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type CoverImageProps = {
  imageProps: React.ComponentProps<typeof Image>;
  linkProps: React.ComponentProps<typeof Link>;
};

export function CoverImage({ imageProps, linkProps }: CoverImageProps) {
  return (
    <Link
      {...linkProps}
      className={clsx(
        "h-full w-full overflow-hidden rounded-xl",
        linkProps.className,
      )}
    >
      <Image
        {...imageProps}
        className={clsx(
          "h-full w-full object-cover object-center transition-transform duration-300 ease-in-out hover:scale-105",
          imageProps.className,
        )}
        alt={imageProps.alt}
      />
    </Link>
  );
}
