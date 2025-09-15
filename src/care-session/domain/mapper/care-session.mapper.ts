import { CareSessionDetail } from '../model/care-session.model';

export class CareSessionMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toCareSessionDetail(raw: any[]): CareSessionDetail[] {
    return raw.map(
      ({
        CareSessionDiagnosis,
        CareSessionTreatment,
        DrugOrder,
        VitalSign,
        ...res
      }) => ({
        ...res,
        diagnoses: CareSessionDiagnosis.map(({ diagnosis }) => ({
          id: diagnosis.id,
          name: diagnosis.name,
        })),
        drug_orders: DrugOrder,
        vital_sign: VitalSign,
        treatments: CareSessionTreatment,
      }),
    );
  }
}
