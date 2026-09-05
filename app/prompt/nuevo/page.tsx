import type { Metadata } from "next";
import PromptForm from "@/components/prompts/PromptForm";

export const metadata: Metadata = {
  title: "Subir un Prompt",
  description: "Publica y vende tu prompt para la comunidad.",
};

export default function NewPromptPage() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute -top-20 right-0 h-[300px] w-[300px] rounded-full bg-yellow-brand/15 blur-[110px]" />

      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-center text-4xl font-extrabold">
          <span className="gradient-text">Subir un Prompt</span>
        </h1>
        <p className="mt-3 text-center text-muted">
          Comparte tu creación con la comunidad o ponla a la venta.
        </p>

        <PromptForm />
      </div>
    </div>
  );
}
