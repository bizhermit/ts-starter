import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import { useEffect } from "react";
import Label from "@bizhermit/react-addon/dist/elements/label";
import SignoutButton from "../../components/elements/signout-button";
import ArrayUtils from "@bizhermit/basic-utils/dist/array-utils";

type InitParams = {
  user: { id: string; name: string; };
  error?: any;
};

const SigninPage: NextPage<InitParams> = ({ user, error }) => {
  useEffect(() => {
    console.log(user, error);
  }, [user, error]);
  
  return (
    <>
      <Label>User top</Label>
      <SignoutButton />
    </>
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