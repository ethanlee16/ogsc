import React from "react";

type Props = React.PropsWithChildren<{
  open?: boolean;
  className: string;
}>;

const Modal: React.FC<Props> = ({ children, open, className }: Props) => {
  return open ? (
    <div className="absolute top-0 left-0 w-screen h-screen bg-dark bg-opacity-50 flex justify-center items-center">
      <div className={`bg-white rounded px-10 pt-12 pb-8 ${className}`}>
        {children}
      </div>
    </div>
  ) : null;
};

export default Modal;
