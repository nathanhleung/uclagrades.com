import {
  DepartmentRankingPage,
  rankingMetadata,
  type PageProps,
} from "../../components/DepartmentRankingPage";
import { rankingSubjects } from "../../utils";

const kind = "least-popular-classes-in";
export const dynamicParams = false;
export function generateStaticParams() {
  return rankingSubjects;
}
export function generateMetadata(props: PageProps) {
  return rankingMetadata(props, kind);
}
export default function Page(props: PageProps) {
  return <DepartmentRankingPage {...props} kind={kind} />;
}
