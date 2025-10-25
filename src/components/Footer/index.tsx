import Image from "next/image";
import Link from "next/link";

import image from "./app_ico-ft.png";

export function Footer() {
  return (
    <footer className="mt-6 px-1 text-center">
      <p>
        <span className="flex items-center justify-center px-12">
          <span className="px-3">
            <Image alt="BPM - Tech" src={image.src} width="30" height="30" />
          </span>
          Copyright &copy; - BPM - Tech
        </span>
        <Link href="/">JM Fitness Studio</Link>
      </p>
    </footer>
  );
}
