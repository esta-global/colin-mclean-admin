import * as Yup from "yup";

export interface HeaderSubChildMenuItem {
  label: string;
  link: string;
  sortOrder: number;
  status: boolean;
}

export interface HeaderChildMenuItem {
  label: string;
  link: string;
  sortOrder: number;
  status: boolean;
  children: HeaderSubChildMenuItem[];
}

export interface HeaderMenuItem {
  label: string;
  link: string;
  sortOrder: number;
  status: boolean;
  children: HeaderChildMenuItem[];
}

export interface HeaderManagementValues {
  logo: string;
  logoAlt: string;
  menuItems: HeaderMenuItem[];
}

const stringField = () => Yup.string().trim();

export const createEmptyChildMenuItem = (sortOrder = 0): HeaderChildMenuItem => ({
  label: "",
  link: "",
  sortOrder,
  status: true,
  children: [],
});

export const createEmptySubChildMenuItem = (sortOrder = 0): HeaderSubChildMenuItem => ({
  label: "",
  link: "",
  sortOrder,
  status: true,
});

export const createEmptyMenuItem = (sortOrder = 0): HeaderMenuItem => ({
  label: "",
  link: "",
  sortOrder,
  status: true,
  children: [],
});

export const headerManagementSchema = Yup.object({
  logo: stringField(),
  logoAlt: stringField(),
  menuItems: Yup.array().of(
    Yup.object({
      label: stringField(),
      link: stringField(),
      sortOrder: Yup.number(),
      status: Yup.boolean(),
      children: Yup.array().of(
        Yup.object({
          label: stringField(),
          link: stringField(),
          sortOrder: Yup.number(),
          status: Yup.boolean(),
          children: Yup.array().of(
            Yup.object({
              label: stringField(),
              link: stringField(),
              sortOrder: Yup.number(),
              status: Yup.boolean(),
            }),
          ),
        }),
      ),
    }),
  ),
});

export const headerManagementInitialValues: HeaderManagementValues = {
  logo: "",
  logoAlt: "Indian Fan Manufacturers Association",
  menuItems: [
    { label: "Home", link: "/", sortOrder: 1, status: true, children: [] },
    { label: "About Us", link: "/about-us", sortOrder: 2, status: true, children: [] },
    { label: "Insights", link: "/insights", sortOrder: 3, status: true, children: [] },
    {
      label: "Members",
      link: "",
      sortOrder: 4,
      status: true,
      children: [
        {
          label: "Members List",
          link: "",
          sortOrder: 1,
          status: true,
          children: [
            { label: "Primary Members List", link: "/member-list/primary", sortOrder: 1, status: true },
            { label: "Associate Members List", link: "/member-list/associate", sortOrder: 2, status: true },
          ],
        },
        { label: "Types Of Membership", link: "/types-of-membership", sortOrder: 2, status: true, children: [] },
        { label: "Become A Member", link: "/become-a-member", sortOrder: 3, status: true, children: [] },
      ],
    },
    { label: "Events & Media", link: "/events-media", sortOrder: 5, status: true, children: [] },
    { label: "Blog", link: "/blog", sortOrder: 6, status: true, children: [] },
    { label: "Trivia", link: "/posts", sortOrder: 7, status: true, children: [] },
  ],
};
