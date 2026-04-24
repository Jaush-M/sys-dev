export type FlashMessageLevel = "info" | "success" | "warning" | "error";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type FlashMessage = {
  message: string;
  level?: FlashMessageLevel;
  description?: string;
  duration?: number;
  position?: ToastPosition;
  closeButton?: boolean;
  options?: {
    description?: string;
    duration?: number;
    position?: ToastPosition;
    closeButton?: boolean;
  };
};

export function flashRedirect({
  status,
  location,
  ...flash
}: FlashMessage & {
  status: number;
  location: string;
}) {
  const params = new URLSearchParams();
  params.set("flash", encodeURIComponent(JSON.stringify(flash)));

  return {
    status,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
    },
    body: {
      errors: undefined,
      flash,
    },
  };
}

export function flashResponse({
  status,
  errors,
  ...flash
}: FlashMessage & {
  status: number;
  errors?: Record<string, string[] | string>;
}) {
  return {
    status,
    body: {
      errors,
      flash,
    },
  };
}

export type FlashResponseType =
  | ReturnType<typeof flashResponse>
  | ReturnType<typeof flashRedirect>;
