import Rank1Icon from "/src/assets/images/Rank1.svg";
import Rank2Icon from "/src/assets/images/Rank2.svg";
import Rank3Icon from "/src/assets/images/Rank3.svg";
import Rank4Icon from "/src/assets/images/Rank4.svg";
import Rank5Icon from "/src/assets/images/Rank5.svg";

export const RankIcon = (rank: number | undefined) => {
  if (typeof rank === "undefined") return "";
  return rank <= 10
    ? Rank1Icon
    : rank <= 20
    ? Rank2Icon
    : rank <= 30
    ? Rank3Icon
    : rank <= 40
    ? Rank4Icon
    : Rank5Icon;
};
