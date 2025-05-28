import { AssistanceType } from '../enums/assistance-type.enum';
import { Skill } from '../enums/skill.enum';

export const ASSISTANCE_TYPE_SKILLS: Record<AssistanceType, Skill[]> = {
  [AssistanceType.ChildCare]: [
    Skill.InfantCare,
    Skill.ToddlerSupervision,
    Skill.HomeworkHelp,
    Skill.MealPreparation,
    Skill.FirstAidCPR,
    Skill.SpecialNeedsSupport,
    Skill.PlaytimeActivities,
    Skill.BedtimeRoutines,
    Skill.LightHousekeeping,
  ],
  [AssistanceType.ElderlyCare]: [
    Skill.MedicationReminders,
    Skill.MobilityAssistance,
    Skill.Companionship,
    Skill.MealPreparation,
    Skill.PersonalHygiene,
    Skill.DementiaCare,
    Skill.ErrandsShopping,
    Skill.LightHousekeeping,
    Skill.PhysicalTherapySupport,
  ],
  [AssistanceType.PetsCare]: [
    Skill.DogWalking,
    Skill.FeedingWatering,
    Skill.PetGrooming,
    Skill.AdministeringMedication,
    Skill.LitterBoxCleaning,
    Skill.PetSitting,
    Skill.TrainingPlay,
    Skill.ExoticPetCare,
  ],
  [AssistanceType.HouseKeeping]: [
    Skill.GeneralCleaning,
    Skill.Laundry,
    Skill.Ironing,
    Skill.DeepCleaning,
    Skill.Organizing,
    Skill.Dishwashing,
    Skill.WindowCleaning,
    Skill.GroceryShopping,
    Skill.ErrandRunning,
  ],
} as const;
