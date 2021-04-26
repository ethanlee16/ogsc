import { ProfileCategory } from "interfaces";
import { useRouter } from "next/router";
import { useCreateProfileContext } from "pages/admin/players/create/[profileCategory]";
import React from "react";
import BarTab from "./ProgressBar";

type Props = {
  children: React.ReactNode;
};

const categories = Object.values(ProfileCategory);
export const usePlayerFormCategoryIndex = (): number => {
  const router = useRouter();
  const currentTabIndex = categories.findIndex(
    (category: ProfileCategory) => router.query.profileCategory === category
  );
  return currentTabIndex;
};

const PlayerFormLayout: React.FC<Props> = ({ children }: Props) => {
  const currentTabIndex = usePlayerFormCategoryIndex();
  const { state } = useCreateProfileContext();

  return (
    <div className="text-dark">
      <div className="mt-6 flex">
        <BarTab fill content="1. Basic Info" title="" />
        {categories.map((category: ProfileCategory, index: number) => {
          const displayIndex = index + 2;
          return (
            <BarTab
              fill={currentTabIndex >= index}
              content={`${displayIndex}. ${category}`}
              title={category}
              disabled={state.player === null}
            />
          );
        })}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PlayerFormLayout;
