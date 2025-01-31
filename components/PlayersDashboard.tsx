import Link from "next/link";
import useSessionInfo from "utils/useSessionInfo";
import PageNav from "components/PageNav";
import { IPlayer, UserRoleLabel } from "interfaces";
import Icon from "components/Icon";
import { useState } from "react";
import { deserializeProfileFieldValue } from "utils/buildUserProfile";
import usePagination from "utils/usePagination";
import useProfilePicture from "utils/useProfilePicture";

interface ReadManyPlayersDTO {
  users: IPlayer[];
  total: number;
}

type PlayerDashboardProps = {
  phrase: string;
  isFilterOn: boolean;
  relatedPlayerIds: number[];
};

const PlayerDashboardItem: React.FunctionComponent<
  IPlayer & { relatedPlayerIds: number[] }
> = ({ relatedPlayerIds, ...player }) => {
  const session = useSessionInfo();
  const [showHoverPlayer, setShowHoverPlayer] = useState(false);

  const image = useProfilePicture(player);

  const link = `/${session.sessionType.toLowerCase()}/players/${player.id}`;
  return (
    <Link href={link}>
      <div role="button" className=" hover:bg-hover">
        <hr className="border-unselected border-opacity-50" />
        <div className="grid grid-cols-12 gap-12 justify-items-start m-5">
          <div className="flex flex-row col-span-7">
            <img
              src={image || "/placeholder-profile.png"}
              className="w-10 h-10 mr-4 bg-placeholder rounded-full"
              alt=""
            />
            <p className="self-center text-sm font-semibold">{player.name}</p>
          </div>
          <p className="self-center col-span-4">
            {deserializeProfileFieldValue(player.profile?.YearOfBirth?.current)}
          </p>
          <div className="flex flex-row relative">
            {(UserRoleLabel[session.sessionType] === "Donor" ||
              UserRoleLabel[session.sessionType] === "Mentor" ||
              UserRoleLabel[session.sessionType] === "Parent") &&
            relatedPlayerIds.includes(player.id) ? (
              <div className="h-12 w-12 self-center">
                <div
                  className="h-12 w-12 absolute right-0 top-0 pr-32"
                  onMouseEnter={() => {
                    setShowHoverPlayer(true);
                  }}
                  onMouseLeave={() => {
                    setShowHoverPlayer(false);
                  }}
                >
                  {showHoverPlayer && (
                    <Icon
                      type="yourPlayer"
                      className="absolute right-0 top-0 mr-5 -mt-10"
                    />
                  )}
                </div>
                <Icon
                  type="goldStar"
                  className="absolute right-0 top-0 mr-16 mt-4 w-4 h-4"
                />
              </div>
            ) : (
              []
            )}
          </div>
        </div>
        <hr className="border-unselected border-opacity-0" />
      </div>
    </Link>
  );
};

const PlayerDashboard: React.FunctionComponent<PlayerDashboardProps> = ({
  phrase,
  isFilterOn,
  relatedPlayerIds,
}: PlayerDashboardProps) => {
  const [
    visibleData,
    numUIPages,
    currUIPage,
    setUIPage,
  ] = usePagination<IPlayer>(
    [phrase, isFilterOn],
    async (pageNumber: number) => {
      const response = isFilterOn
        ? await fetch(
            `/api/players/search?pageNumber=${pageNumber}&phrase=${phrase}&role=Player&relatedPlayerIds=${relatedPlayerIds}`,
            {
              method: "GET",
              headers: { "content-type": "application/json" },
              redirect: "follow",
            }
          )
        : await fetch(
            `/api/players/search?pageNumber=${pageNumber}&phrase=${phrase}&role=Player&relatedPlayerIds=${null}`,
            {
              method: "GET",
              headers: { "content-type": "application/json" },
              redirect: "follow",
            }
          );
      const data = (await response.json()) as ReadManyPlayersDTO;
      return {
        data: data.users,
        count: data.total,
      };
    }
  );

  return (
    <div>
      <div>
        <div className="grid grid-cols-12 gap-12 text-sm justify-items-start mb-4 mx-5 mt-12 font-semibold text-unselected">
          <p className="col-span-7">Name</p>
          <p className="col-span-4">Birth Year</p>
        </div>
      </div>
      <hr className="border-unselected border-opacity-0" />
      {visibleData.map((player) => (
        <PlayerDashboardItem
          {...player}
          key={player.id}
          relatedPlayerIds={relatedPlayerIds}
        />
      ))}
      <PageNav
        currentPage={currUIPage + 1}
        numPages={numUIPages}
        onPrevPage={() => {
          setUIPage(currUIPage - 1);
        }}
        onNextPage={() => {
          setUIPage(currUIPage + 1);
        }}
        prevDisabled={currUIPage <= 0}
        nextDisabled={currUIPage >= numUIPages - 1}
      />
    </div>
  );
};

export default PlayerDashboard;
