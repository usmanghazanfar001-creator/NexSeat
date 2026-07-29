"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState(10);
  const [method, setMethod] = useState<"STRIPE" | "PAYPAL" | "RAZORPAY" | "JAZZCASH">("STRIPE");
  const [jazzCashChannel, setJazzCashChannel] = useState<"wallet" | "card">("wallet");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/wallet");
    const data = await res.json();
    setBalance(Number(data.balance ?? 0));
  };

  useEffect(() => {
    load();
  }, []);

  const topUp = async () => {
    setLoading(true);
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        paymentMethod: method,
        ...(method === "JAZZCASH" ? { jazzCashChannel } : {}),
      }),
    });
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();

    if (data.method === "POST" && data.fields) {
      // JazzCash requires an actual form POST to its hosted checkout page,
      // not a GET redirect — build and submit a hidden form.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.checkoutUrl;
      Object.entries(data.fields as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      return;
    }

    if (data.method === "RAZORPAY_CHECKOUT_JS") {
      // Razorpay has no hosted redirect URL for a plain order — it uses a
      // client-side widget (Checkout.js) instead. Load it on demand.
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
        document.body.appendChild(script);
      });

      const rzp = new (window as any).Razorpay({
        key: data.razorpayKeyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "NexSeat",
        description: "Wallet top-up",
        // Actual crediting happens server-side via the Razorpay webhook once
        // payment.captured fires — this handler is just UX feedback.
        handler: () => load(),
      });
      rzp.open();
      return;
    }

    window.location.href = data.checkoutUrl; // redirect to gateway checkout
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-bold">Wallet</h1>

      <Card>
        <CardHeader><CardTitle>Balance</CardTitle></CardHeader>
        <CardContent>
          <p className="font-display text-4xl font-bold">{balance !== null ? formatCurrency(balance) : "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add funds</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Amount</label>
            <input
              type="number"
              min={1}
              max={5000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Payment method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
              className="h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="STRIPE">Card (Stripe)</option>
              <option value="PAYPAL">PayPal</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="JAZZCASH">JazzCash (Pakistan)</option>
            </select>
          </div>

          {method === "JAZZCASH" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">JazzCash checkout type</label>
              <select
                value={jazzCashChannel}
                onChange={(e) => setJazzCashChannel(e.target.value as typeof jazzCashChannel)}
                className="h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="wallet">Mobile Wallet (phone + PIN)</option>
                <option value="card">Debit/Credit Card</option>
              </select>
            </div>
          )}

          <Button className="w-full" onClick={topUp} disabled={loading}>
            {loading ? "Redirecting..." : `Add ${formatCurrency(amount)}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
