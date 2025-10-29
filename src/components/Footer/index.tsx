import Image from "next/image";
import Link from "next/link";

import image from "./app_ico-ft.png";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#C2A537]/20 bg-black/40 px-6 py-4 text-center">
      <p>
        <span className="flex items-center justify-center px-4">
          <span className="px-3">
            <Image alt="BPM - Tech" src={image.src} width="30" height="30" />
          </span>
          Copyright &copy; - BPM - Tech
        </span>
        <Link
          href="/"
          className="text-[#C2A537] transition-colors hover:text-[#D4B547]"
        >
          JM Fitness Studio
        </Link>
      </p>
    </footer>
  );
}
