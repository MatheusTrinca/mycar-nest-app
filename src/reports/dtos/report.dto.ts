import { Expose, Transform } from 'class-transformer';

export class ReportDto {
  @Expose()
  id: number;

  @Expose()
  price: number;

  @Expose()
  make: string;

  @Expose()
  model: string;

  @Expose()
  year: number;

  @Expose()
  mileage: number;

  @Expose()
  lat: number;

  @Expose()
  lng: number;

  @Transform(({ obj }) => obj.user.id)
  @Expose()
  userId: number;
}
