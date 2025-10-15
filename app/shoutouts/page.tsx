import {
  DONORS_21F_222,
  DONORS_22F_23S,
  DONORS_241_25S,
  Donors,
} from "../constants";

type DonorsListProps = {
  heading: string;
  donors: Donors;
};

const DonorsList = ({ heading, donors }: DonorsListProps) => {
  return (
    <div className="bg-uclaGold p-12 my-8">
      <h2 className="text-2xl font-bold mb-4">{heading}</h2>
      <div className="text-left grid grid-cols-2 md:grid-cols-3 gap-3 gap-x-6">
        {donors.map((donor) => {
          const donorName = Array.isArray(donor) ? donor[0] : donor;
          const donorLink = Array.isArray(donor) ? donor[1] : undefined;

          return (
            <div key={donorName}>
              {donorLink ? (
                <a className="underline hover:opacity-50" href={donorLink}>
                  <p>{donorName}</p>
                </a>
              ) : (
                <p>{donorName}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Shoutouts() {
  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-1 flex-col justify-center p-6 sm:p-12 md:p-16 pb-0 sm:pb-0 md:pb-0 md:max-w-[85%] lg:max-w-[60%] md:mx-auto">
        <h1 className="text-4xl text-center mb-6 text-black font-bold">
          Shoutouts
        </h1>
        <div className="text-justify">
          <p>
            Thank you to the following individuals who contributed funds in
            order to get the grade distributions on this site:
          </p>
          <DonorsList heading="2024–25" donors={DONORS_241_25S} />
          <DonorsList heading="2022–23" donors={DONORS_22F_23S} />
          <DonorsList heading="2021–22" donors={DONORS_21F_222} />

          <p>
            If you&apos;re on the list above and you&apos;d like a link added to
            your name, please{" "}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfxHpdeTTvFzX4slKx-KGKgvqZM3GfABXIlHcuBHXiKhLhpwQ/viewform?usp=sf_link"
              className="text-uclaBlue hover:opacity-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              submit a message and leave your email
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
