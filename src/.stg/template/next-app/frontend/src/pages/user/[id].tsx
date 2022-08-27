import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import { useEffect } from "react";
import Label from "@bizhermit/react-addon/dist/elements/label";
import ArrayUtils from "@bizhermit/basic-utils/dist/array-utils";
import SignedinContainer from "../../components/layouts/signedin-container";

type InitParams = {
  user: { id: string; name: string; };
  error?: any;
};

const SigninPage: NextPage<InitParams> = ({ user, error }) => {
  useEffect(() => {
    console.log(user, error);
  }, [user, error]);
  
  return (
    <SignedinContainer>
      <Label>User top</Label>
      <Label>{JSON.stringify(user ?? {})}</Label>
    </SignedinContainer>
  );
};

const findAllUsers = async () => {
  return ArrayUtils.generateArray(100, (idx) => {
    return {
      id: `user${idx}`,
      name: `user ${idx}`,
    };
  });
};

export const getStaticPaths: GetStaticPaths = async () => {
  const users = await findAllUsers();
  const paths = users.map(user => `/user/${user.id}`);
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string; };

  try {
    const user = (await findAllUsers()).find(user => user.id === id) ?? { id, name: `no user - ${id}`};
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      props: {
        error: err,
      },
    };
  }
}

export default SigninPage;