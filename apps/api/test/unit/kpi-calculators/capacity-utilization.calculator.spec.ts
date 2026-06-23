import { Test, TestingModule } from '@nestjs/testing';
import { CapacityUtilizationCalculator } from '../../../src/modules/inventory-production/calculators/capacity-utilization.calculator';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('CapacityUtilizationCalculator', () => {
  let calculator: CapacityUtilizationCalculator;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CapacityUtilizationCalculator,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    calculator = module.get<CapacityUtilizationCalculator>(CapacityUtilizationCalculator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculate', () => {
    it('debería calcular correctamente el porcentaje de utilización', async () => {
      // Configurar los mocks de Prisma
      prisma.machine.findUnique.mockResolvedValue({
        id: 'machine-1',
        name: 'Máquina Principal',
        maxCapacity: 1000,
      } as any);

      prisma.productionRecord.aggregate.mockResolvedValue({
        _sum: {
          quantityProduced: 750,
        },
      } as any);

      const result = await calculator.calculate('machine-1', new Date('2024-01-01'), new Date('2024-01-31'));

      expect(result.utilizationPercentage).toBe(75.00);
      expect(result.capacityUsed).toBe(750);
      expect(result.capacityAvailable).toBe(1000);
    });

    it('debería retornar 0% cuando no hay capacidad disponible', async () => {
      prisma.machine.findUnique.mockResolvedValue({
        id: 'machine-2',
        name: 'Máquina Dañada',
        maxCapacity: 0,
      } as any);

      prisma.productionRecord.aggregate.mockResolvedValue({
        _sum: {
          quantityProduced: 0,
        },
      } as any);

      const result = await calculator.calculate('machine-2', new Date('2024-01-01'), new Date('2024-01-31'));

      expect(result.utilizationPercentage).toBe(0);
    });

    it('debería arrojar error si la máquina no existe', async () => {
      prisma.machine.findUnique.mockResolvedValue(null);

      await expect(
        calculator.calculate('invalid-machine', new Date('2024-01-01'), new Date('2024-01-31'))
      ).rejects.toThrow('Machine not found');
    });
  });
});
