export const courses = ["B.Tech", "MBA", "MCA"];
export const courseYears = { "B.Tech": 4, MBA: 2, MCA: 3 };
export const branches = [
  ["cse", "Computer Science and Engineering"],
  ["ece", "Electronics and Communication Engineering"],
  ["ee", "Electrical Engineering"],
  ["ecm", "Engineering and Computational Mechanics"],
  ["me", "Mechanical Engineering"],
  ["civil", "Civil Engineering"],
  ["pie", "Production and Industrial Engineering"],
  ["chemical", "Chemical Engineering"],
  ["biotech", "Biotechnology"],
  ["material engineering", "Materials Engineering"],
];
export function branchName(value = "") {
  const lower = value.trim().toLowerCase();
  if (lower === "mechanical") return "Mechanical Engineering";
  return (
    branches.find(
      ([alias, label]) => alias === lower || label.toLowerCase() === lower,
    )?.[1] || value
  );
}
