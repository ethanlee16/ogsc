/* eslint-disable no-console */
import {
  Absence,
  AbsenceCreateWithoutUsersInput,
  PrismaClient,
  ProfileFieldCreateWithoutUserInput,
  ProfileFieldKey,
  User,
  UserCreateArgs,
} from "@prisma/client";
import Faker from "faker";
import Ora from "ora";
import { AbsenceReason, AbsenceType } from "../interfaces";
import hashPassword from "../utils/hashPassword";

const NUMBER_USERS = 10;

function generateFieldsAcrossTimestamps(
  key: ProfileFieldKey,
  generateValue: () => unknown
): ProfileFieldCreateWithoutUserInput[] {
  return [
    new Date("2020-10-01T12:00:00+00:00"),
    new Date("2020-10-15T12:00:00+00:00"),
    new Date("2020-10-30T12:00:00+00:00"),
  ].map(
    (date: Date) =>
      <ProfileFieldCreateWithoutUserInput>{
        key,
        value: String(generateValue()),
        createdAt: date,
      }
  );
}

export default async function seedDatabase(): Promise<void> {
  const prisma = new PrismaClient();
  const clearAllMessage = Ora("Cleaning up previous seeded information");
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          endsWith: "@ogsc.dev",
        },
      },
    });
    await prisma.userInvite.deleteMany({
      where: {
        user_id: {
          in: users.map((user: User) => user.id),
        },
      },
    });
    await prisma.absence.deleteMany({
      where: {
        userId: {
          in: users.map((user: User) => user.id),
        },
      },
    });
    await prisma.profileField.deleteMany({
      where: {
        userId: {
          in: users.map((user: User) => user.id),
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: "@ogsc.dev",
        },
      },
    });
    clearAllMessage.text = "Cleaned up previous seeded information";
    clearAllMessage.succeed();
  } catch (err) {
    clearAllMessage.fail(
      `Could not clean up previous seeded information\n\n${err.message}`
    );
    process.exit(1);
  }

  const adminCreateMessage = Ora(`Creating admin user`).start();
  try {
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@ogsc.dev",
        phoneNumber: Faker.phone.phoneNumber("(!##) !##-####"),
        hashedPassword: hashPassword("password"),
        isAdmin: true,
      },
    });
    adminCreateMessage.text = "Created the admin user.";
    adminCreateMessage.succeed();
  } catch (err) {
    adminCreateMessage.fail(`Creating the admin user failed\n\n${err.message}`);
  }

  const usersCreateMessage = Ora(`Creating ${NUMBER_USERS} players`).start();
  const mockPlayers: UserCreateArgs[] = Array(NUMBER_USERS)
    .fill(null)
    .map((_value: null, index: number) => {
      return {
        data: {
          email: `player${index}@ogsc.dev`,
          hashedPassword: hashPassword("password"),
          name: `${Faker.name.firstName()} ${Faker.name.lastName()}`,
          phoneNumber: Faker.phone.phoneNumber("(!##) !##-####"),
          viewerPermissions: {
            create: {
              relationship_type: "Player to Player",
              viewee: {
                connect: {
                  email: `player${index}@ogsc.dev`,
                },
              },
            },
          },
          absences: {
            create: Object.values(AbsenceType).flatMap((type: AbsenceType) =>
              Array<Absence | null>(Faker.random.number(3))
                .fill(null)
                .map(
                  () =>
                    <AbsenceCreateWithoutUsersInput>{
                      type,
                      date: Faker.date.recent(90),
                      reason: Faker.random.arrayElement(
                        Object.values(AbsenceReason)
                      ),
                      description: Faker.lorem.lines(1),
                    }
                )
            ),
          },
          profileFields: {
            create: [
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.AcademicEngagementScore,
                () => Faker.random.number(10)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.AdvisingScore,
                () => Faker.random.number(10)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.AthleticScore,
                () => Faker.random.number(10)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.BioAboutMe,
                () => Faker.lorem.lines(2)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.BioFavoriteSubject,
                () => Faker.lorem.lines(2)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.BioHobbies,
                () => Faker.lorem.lines(2)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.BioMostDifficultSubject,
                () => Faker.lorem.lines(1)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.BioParents,
                () => Faker.lorem.sentences(1)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.BioSiblings,
                () => Faker.lorem.sentences(1)
              ),
              ...generateFieldsAcrossTimestamps(ProfileFieldKey.BMI, () =>
                Faker.random.float({ min: 18, max: 30, precision: 0.1 })
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.DisciplinaryActions,
                () => Faker.lorem.lines(2)
              ),
              ...generateFieldsAcrossTimestamps(ProfileFieldKey.GPA, () =>
                Faker.random.float({
                  min: 2,
                  max: 4,
                  precision: 0.01,
                })
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.HealthAndWellness,
                () => Faker.lorem.lines(2)
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.Highlights,
                () => Faker.internet.url()
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.IntroVideo,
                () => Faker.internet.url()
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.MileTime,
                () =>
                  `${Faker.random.number({
                    min: 4,
                    max: 8,
                  })}:${String(Faker.random.number({ max: 59 })).padStart(
                    2,
                    "0"
                  )}`
              ),
              ...generateFieldsAcrossTimestamps(ProfileFieldKey.PacerTest, () =>
                Faker.random.number({ min: 40, max: 100 })
              ),
              ...generateFieldsAcrossTimestamps(
                ProfileFieldKey.PlayerNumber,
                () => Faker.random.number(100)
              ),
              ...generateFieldsAcrossTimestamps(ProfileFieldKey.Pushups, () =>
                Faker.random.number(100)
              ),
              ...generateFieldsAcrossTimestamps(ProfileFieldKey.Situps, () =>
                Faker.random.number(100)
              ),
            ],
          },
        },
      };
    });
  try {
    await Promise.all(mockPlayers.map(prisma.user.create));
    usersCreateMessage.text = "Created 10 players.";
    usersCreateMessage.succeed();
  } catch (err) {
    usersCreateMessage.fail(`Creating players failed\n\n${err.message}`);
  }

  const mentorsCreateMessage = Ora(`Creating ${NUMBER_USERS} mentors`).start();
  const mockMentors: UserCreateArgs[] = Array(NUMBER_USERS)
    .fill(null)
    .map((_value: null, index: number) => {
      return {
        data: {
          email: `mentor${index}@ogsc.dev`,
          hashedPassword: hashPassword("password"),
          name: `${Faker.name.firstName()} ${Faker.name.lastName()}`,
          phoneNumber: Faker.phone.phoneNumber("(!##) !##-####"),
          viewerPermissions: {
            create: {
              relationship_type: "Mentor to Player",
              viewee: {
                connect: {
                  email: `player${index}@ogsc.dev`,
                },
              },
            },
          },
        },
      };
    });
  try {
    await Promise.all(mockMentors.map(prisma.user.create));
    mentorsCreateMessage.text = "Created 10 mentors.";
    mentorsCreateMessage.succeed();
  } catch (err) {
    mentorsCreateMessage.fail(`Creating mentors failed\n\n${err.message}`);
  }

  const parentsCreateMessage = Ora(`Creating ${NUMBER_USERS} parents`).start();
  const mockParents: UserCreateArgs[] = Array(NUMBER_USERS)
    .fill(null)
    .map((_value: null, index: number) => {
      return {
        data: {
          email: `parent${index}@ogsc.dev`,
          hashedPassword: hashPassword("password"),
          name: `${Faker.name.firstName()} ${Faker.name.lastName()}`,
          phoneNumber: Faker.phone.phoneNumber("(!##) !##-####"),
          viewerPermissions: {
            create: {
              relationship_type: "Parent to Player",
              viewee: {
                connect: {
                  email: `player${index}@ogsc.dev`,
                },
              },
            },
          },
        },
      };
    });
  try {
    await Promise.all(mockParents.map(prisma.user.create));
    parentsCreateMessage.text = "Created 10 parents.";
    parentsCreateMessage.succeed();
  } catch (err) {
    parentsCreateMessage.fail(`Creating parents failed\n\n${err.message}`);
  }

  const donorsCreateMessage = Ora(`Creating ${NUMBER_USERS} mentors`).start();
  const mockDonors: UserCreateArgs[] = Array(NUMBER_USERS)
    .fill(null)
    .map((_value: null, index: number) => {
      return {
        data: {
          email: `donor${index}@ogsc.dev`,
          hashedPassword: hashPassword("password"),
          name: `${Faker.name.firstName()} ${Faker.name.lastName()}`,
          phoneNumber: Faker.phone.phoneNumber("(!##) !##-####"),
          viewerPermissions: {
            create: {
              relationship_type: "Donor to Player",
              viewee: {
                connect: {
                  email: `player${index}@ogsc.dev`,
                },
              },
            },
          },
        },
      };
    });
  try {
    await Promise.all(mockDonors.map(prisma.user.create));
    donorsCreateMessage.text = "Created 10 donors.";
    donorsCreateMessage.succeed();
  } catch (err) {
    donorsCreateMessage.fail(`Creating donors failed\n\n${err.message}`);
  }

  process.exit(0);
}

seedDatabase();
