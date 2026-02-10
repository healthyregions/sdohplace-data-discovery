import * as React from "react";
import Image from "next/image";
import { AiOutlineMenu } from "react-icons/ai";
import { usePlausible } from "next-plausible";
import { EventType } from "@/lib/event";

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, onMenuClick }) => {
  const plausible = usePlausible();

  const handleGetStartedClick = () => {
    const target = document.getElementById("sdoh-learn-more");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    plausible(EventType.ClickedGetStarted);
  };

  const handleMenuClick = () => {
    const navbarTrigger = document.getElementById("navbar-mobile-trigger");
    if (navbarTrigger) {
      navbarTrigger.click();
    }
    onMenuClick();
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/discovery_logo.svg"
            alt="Data Discovery Logo"
            width={50}
            height={50}
            style={{ objectFit: "contain" }}
          />
          <h2 className="m-0 text-2xl font-fredoka">{title}</h2>
        </div>
        <button
          onClick={handleMenuClick}
          className="p-2 bg-transparent border-none cursor-pointer"
          aria-label="Open menu"
        >
          <AiOutlineMenu size={28} />
        </button>
      </div>
      <p
        className="mt-3 text-sm leading-relaxed"
        style={{ textWrap: "balance" }}
      >
        Get access to spatially indexed and curated resources, that are free and
        specifically designed for conducting health equity research.{" "}
        <a
          onClick={handleGetStartedClick}
          className="no-underline text-frenchviolet cursor-pointer"
        >
          <strong>Get started&rarr;</strong>
        </a>
      </p>
    </div>
  );
};

export default MobileHeader;
