import { CartProvider } from "@/lib/cart";
import { KioskScreen } from "@/components/KioskScreen";

export default function Home() {
  return (
    <CartProvider>
      <KioskScreen />
    </CartProvider>
  );
}
