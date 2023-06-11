import SaveIcon from "@/components/icons/save";
import authenticate from "@/utilities/authentication";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";

interface Ipageprops {
    user: string,
    profilePicUrl: string
}

const UserInfo = (props: Ipageprops) => {
    return (
        <div className="pt-navbar flex flex-col justify-start items-center h-full min-h-screen">

            <div className="mb-8 shadow-info-card-all-sides border border-solid w-[1000px] h-72 rounded-xl flex flex-col justify-between items-stretch my-8 p-4">
                {/*top  container */}
                <div className="flex flex-row justify-between items-start">
                    <div className="flex flex-row justify-start items-start">

                        <Image src={'/Profile_Picture.svg'} alt="Profile Picture" height={160} width={160} className="mr-3" />

                        <div className="flex flex-col h-[160px] justify-start">
                            <h3 className="mt-7">HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH</h3>
                            <h4 className="mt-6">Email: {props.user}</h4>
                        </div>

                    </div>

                    <button className="p-3 rounded-lg flex flex-row justify-center items-center h-8 border-none bg-secondary-btn text-base cursor-pointer">
                        <Image src='/edit.svg' alt="" height={16} width={16} className="mr-2" />
                        Edit</button>

                </div>

                <div className="flex flex-row justify-around items-center">
                    <a href="/post blog" target="_blank">
                        <div className="flex flex-row justify-center items-center">
                            <Image src='/link.svg' alt='' height={16} width={16} />
                            <h5 className="ml-2">Drafts: 3</h5>
                        </div>
                    </a>

                    <div>
                        <h5 className="cursor-pointer">Followers: 5</h5>


                    </div>

                    <div className="flex flex-row justify-start items-center">
                        <Image src='/calender.svg' alt='' height={16} width={16} className="mr-2" />
                        <p>Joined May, 2023</p>
                    </div>

                </div>




            </div>

            <h2 className="mb-4">Blogs</h2>

            {/* map fucntion */}
            {[1, 2, 3, 4].map(i => (

                <div className='mb-5 p-5 flex flex-col border border-solid rounded-lg w-[900px] h-72 bg-white'>
                    {/* image name and follow button */}
                    <div className='flex flex-row justify-between mb-4'>
                        <div className='flex flex-row justify-start items-center'>
                            <Image src="/Profile_Picture.svg" alt="profile picture" height={48} width={48} className='rounded-half mr-2' />
                            <div>
                                <h4>Name</h4>
                                <div className='flex flex-row justify-between items-center'>
                                    <h5>email@domain.com</h5>
                                    <h5 className='ml-3'>23 May, 2023</h5>

                                </div>
                            </div>

                        </div>

                    </div>

                    {/* title content and cover image */}
                    <div className='w-full flex flex-row justify-start items-start mb-4'>
                        {/* title and desc */}
                        <div>
                            <Link href={'#'}>
                                <h2 title='AWS Lambda Function: IAM User Password Expiry Notice | SES, Boto3 & Terraform' className='w-[600px] h-16 text-ellipsis-2'>AWS Lambda Function: IAM User Password Expiry Notice | SES, Boto3 & Terraform</h2>

                                <p className='w-[600px] text-ellipsis-4'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore eos ipsam voluptatem deserunt ad minima ut aperiam ab dignissimos? Sed quod enim quam commodi officia! Minima debitis officiis ullam maxime?
                                    Porro, sed obcaecati. Odit earum autem unde facilis soluta, nobis repellat nulla aut hic ea, vitae quos pariatur quae aliquam sit saepe maiores repudiandae totam impedit dolorum velit fuga laudantium.
                                    Repudiandae doloribus officia, obcaecati, libero, culpa voluptate quibusdam ut quam eos distinctio ad in fugit ipsum! Eos ipsa obcaecati, modi eum ex totam tenetur iure sed molestiae dolorem architecto voluptates!</p>
                            </Link>
                        </div>

                        <Link href={'#'}>
                            <img src="/Sample-png-image-500kb.png" alt="" className='rounded-lg h-[135px] w-[255px] object-contain' />
                        </Link>
                    </div>

                </div>
            ))}
        </div>
    );
}

export default UserInfo;


export const getServerSideProps = async ({ req, res, resolvedUrl }: GetServerSidePropsContext) => {
    const { cookies, current_user, profilePicUrl } = await commonGetServerSidePropsFunc({ req })

    if (cookies.length > 0) {
        console.log('index...', [...cookies])
        res.setHeader('Set-Cookie', [...cookies])
    }

    if (current_user === '') {
        return {
            redirect: {
                permanent: false,
                destination: `/user/login?callback=${resolvedUrl}`,
            }
        };
    }

    return {
        props: { user: current_user, profilePicUrl }
    }
}