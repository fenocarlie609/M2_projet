import { toast } from "react-toastify";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

export const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastConfig,
      icon: <CheckCircle size={20} className="text-green-500" />,
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: <AlertCircle size={20} className="text-red-500" />,
    });
  },
  info: (message) => {
    toast.info(message, {
      ...toastConfig,
      icon: <Info size={20} className="text-blue-500" />,
    });
  },
  warn: (message) => {
    toast.warn(message, {
      ...toastConfig,
      icon: <AlertTriangle size={20} className="text-amber-500" />,
    });
  },
};
