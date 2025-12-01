/*
 * Author(s): Marco Martinez
 * Date: 11/02/25
 * Description: Creates a reusable popup component
 */

"use client";

type PopupProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Popup({ title, children, onClose }: PopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9999">
      <div className="bg-white p-6 rounded shadow-lg w-96 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
