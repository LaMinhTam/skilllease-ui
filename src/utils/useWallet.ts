import { useEffect, useState } from "react";
import api from "../api";

interface Wallet {
  id: number;
  balance: number;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/payment/wallet");
        setWallet(res.data.data);
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      }
    };

    fetchWallet();
  }, []);

  return wallet;
};
