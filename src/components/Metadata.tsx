import { Helmet } from "react-helmet";

// Props Type
type PropsType = {
  title: string;
  description?: string;
};

export function Metadata({ title, description }: PropsType) {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title} </title>
      <meta name="description" content={description || title} />
    </Helmet>
  );
}
