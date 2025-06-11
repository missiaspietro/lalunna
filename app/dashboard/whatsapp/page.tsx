import { Metadata } from "next"
import { WhatsAppContent } from "./components/WhatsAppContent"

export const metadata: Metadata = {
  title: "WhatsApp",
  description: "Gerenciamento de mensagens do WhatsApp",
}

export default function WhatsAppPage() {
  return <WhatsAppContent />
}
