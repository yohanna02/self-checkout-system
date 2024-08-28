import { useQuery } from "@tanstack/react-query";
import React, { createContext, useEffect, useReducer, useState } from "react";
import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
  doc,
} from "firebase/firestore";
import { auth, store } from "@/lib/firebase";

export interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

type statusType = "loading" | "error" | "success" | "idle";

export const cartContext = createContext<{
  cartData: CartItemType[];
  status: statusType;
  refetch: () => void;
}>({
  cartData: [],
  status: "idle",
  refetch: () => {},
});

const CartContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<statusType>("idle");
  const cartQuery = useQuery({
    queryKey: ["carts"],
    queryFn: async function () {
      console.log("hello");
      const ref = query(
        collection(store, "carts"),
        where("userId", "==", auth.currentUser?.uid)
      );
      const snap = await getDocs(ref);
      console.log("auth", auth.currentUser?.uid);

      const cartItems: CartItemType[] = [];
      for (const cartItem of snap.docs) {
        const data = cartItem.data();
        const product = await getDoc(doc(store, "products", data.productId));
        cartItems.push({
          id: cartItem.id as string,
          name: product.data()?.name as string,
          price: product.data()?.price as number,
          quantity: data.quantity as number,
          imageUrl: product.data()?.image_url as string,
        });
      }
      console.log("cart", cartItems);
      return cartItems;
    },
  });

  async function refetch() {
    await cartQuery.refetch();
  }

  useEffect(
    function () {
      if (cartQuery.isLoading) {
        setStatus("loading");
      } else if (cartQuery.isError) {
        setStatus("error");
      } else if (cartQuery.isSuccess) {
        setStatus("success");
      } else {
        setStatus("idle");
      }
    },
    [cartQuery]
  );

  return (
    <cartContext.Provider
      value={{
        cartData: cartQuery.data as CartItemType[],
        status,
        refetch,
      }}
    >
      {children}
    </cartContext.Provider>
  );
};

export default CartContextProvider;
